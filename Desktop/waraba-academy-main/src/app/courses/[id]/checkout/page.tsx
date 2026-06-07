/**
 * /courses/[id]/checkout est un alias legacy.
 * On redirige immédiatement vers /courses/[id]/payment qui contient
 * la vraie intégration Wave + Stripe.
 */
import { redirect } from 'next/navigation';

export default function CheckoutPage({ params }: { params: { id: string } }) {
  redirect(`/courses/${params.id}/payment`);
}
