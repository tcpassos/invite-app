import { InviteStatus } from '@invite-app/contract';
import { INVITE_STATUS_LABEL } from './format';

export function StatusBadge({ status }: { status: InviteStatus }) {
  return (
    <span className={status === InviteStatus.Published ? 'badge badge--published' : 'badge'}>
      {INVITE_STATUS_LABEL[status]}
    </span>
  );
}
