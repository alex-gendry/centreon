# 
# Copyright 2019 Centreon (http://www.centreon.com/)
#
# Centreon is a full-fledged industry-strength solution that meets
# the needs in IT infrastructure and application monitoring for
# service performance.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#

package gorgone::modules::core::cron::hooks;

use warnings;
use strict;
use gorgone::class::core;
use gorgone::modules::core::cron::class;
use gorgone::standard::constants qw(:all);

use constant NAMESPACE => 'core';
use constant NAME => 'cron';
use constant EVENTS => [
    { event => 'CRONREADY' },
    { event => 'GETCRON', uri => '/definitions', method => 'GET' },
    { event => 'ADDCRON', uri => '/definitions', method => 'POST' },
    { event => 'DELETECRON', uri => '/definitions', method => 'DELETE' },
    { event => 'UPDATECRON', uri => '/definitions', method => 'PATCH' },
];

my $config_core;
my $config;
my $cron = {};
my $stop = 0;

sub register {
    my (%options) = @_;
    
    $config = $options{config};
    $config_core = $options{config_core};
    return (1, NAMESPACE, NAME, EVENTS);
}

sub init {
    my (%options) = @_;

    create_child(logger => $options{logger});
}

sub routing {
    my (%options) = @_;
    
    if ($options{action} eq 'CRONREADY') {
        $cron->{ready} = 1;
        return undef;
    }
    
    if (gorgone::class::core::waiting_ready(ready => \$cron->{ready}) == 0) {
        gorgone::standard::library::add_history({
            dbh => $options{dbh},
            code => GORGONE_ACTION_FINISH_KO,
            token => $options{token},
            data => { message => 'gorgonecron: still no ready' },
            json_encode => 1
        });
        return undef;
    }
    
    $options{gorgone}->send_internal_message(
        identity => 'gorgone-cron',
        action => $options{action},
        raw_data_ref => $options{frame}->getRawData(),
        token => $options{token}
    );
}

sub gently {
    my (%options) = @_;

    $stop = 1;
    if (defined($cron->{running}) && $cron->{running} == 1) {
        $options{logger}->writeLogDebug("[cron] Send TERM signal $cron->{pid}");
        CORE::kill('TERM', $cron->{pid});
    }
}

sub kill {
    my (%options) = @_;

    if ($cron->{running} == 1) {
        $options{logger}->writeLogDebug("[cron] Send KILL signal for pool");
        CORE::kill('KILL', $cron->{pid});
    }
}

sub kill_internal {
    my (%options) = @_;

}

sub check {
    my (%options) = @_;

    my $count = 0;
    foreach my $pid (keys %{$options{dead_childs}}) {
        # Not me
        next if (!defined($cron->{pid}) || $cron->{pid} != $pid);
        
        $cron = {};
        delete $options{dead_childs}->{$pid};
        if ($stop == 0) {
            create_child(logger => $options{logger});
        }
    }
    
    $count++ if (defined($cron->{running}) && $cron->{running} == 1);
    
    return $count;
}

sub broadcast {
    my (%options) = @_;

    routing(%options);
}

# Specific functions
sub create_child {
    my (%options) = @_;
    
    $options{logger}->writeLogInfo("[cron] Create module 'cron' process");
    my $child_pid = fork();
    if ($child_pid == 0) {
        $0 = 'gorgone-cron';
        my $module = gorgone::modules::core::cron::class->new(
            logger => $options{logger},
            module_id => NAME,
            config_core => $config_core,
            config => $config,
        );
        $module->run();
        exit(0);
    }
    $options{logger}->writeLogDebug("[cron] PID $child_pid (gorgone-cron)");
    $cron = { pid => $child_pid, ready => 0, running => 1 };
}

1;
