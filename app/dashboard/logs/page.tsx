import { redirect } from 'next/navigation';

export default function RedirectToStaffLogs() {
  redirect('/dashboard/staff/logs');
}
