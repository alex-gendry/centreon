import React, { ReactElement } from 'react';

import { Button } from '../Button';

import { useStyles } from './Modal.styles';

export type ModalActionsProps = {
  children?: React.ReactNode;
  disabled?: boolean;
  isDanger?: boolean;
  labels?: ModalActionsLabels;
  onCancel?: () => void;
  onConfirm?: () => void;
};

export type ModalActionsLabels = {
  cancel: string;
  confirm: string;
};

const ModalActions = ({
  children,
  labels,
  onCancel,
  onConfirm,
  isDanger = false,
  disabled
}: ModalActionsProps): ReactElement => {
  const { classes } = useStyles();

  return (
    <div className={classes.modalActions}>
      {children || (
        <>
          <Button
            aria-label={labels?.cancel}
            data-testid="cancel"
            size="small"
            variant="secondary"
            onClick={() => onCancel?.()}
          >
            {labels?.cancel}
          </Button>
          <Button
            aria-label={labels?.confirm}
            data-testid="confirm"
            disabled={disabled}
            isDanger={isDanger}
            size="small"
            type="submit"
            variant="primary"
            onClick={() => onConfirm?.()}
          >
            {labels?.confirm}
          </Button>
        </>
      )}
    </div>
  );
};

export { ModalActions };
