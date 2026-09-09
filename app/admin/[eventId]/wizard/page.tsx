import { getEventForWizard } from '../../actions'
import { WizardForm } from '../../../../components/admin/WizardForm'

export const dynamic = 'force-dynamic'

export default async function Wizard({ params }: { params: Promise<{ eventId: string }> }) {
  const { eventId } = await params
  const { eventName, config } = await getEventForWizard(eventId)

  return <WizardForm eventId={eventId} initialEventName={eventName} initialConfig={config} />
}
