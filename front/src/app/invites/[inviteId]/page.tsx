import { InviteEditorView } from '../../../view/invite-editor-view';

export default async function InvitePage({ params }: { params: Promise<{ inviteId: string }> }) {
  const { inviteId } = await params;
  return <InviteEditorView inviteId={inviteId} />;
}
