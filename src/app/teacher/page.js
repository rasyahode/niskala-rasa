import { redirect } from 'next/navigation';

export default function TeacherRootRedirect() {
  redirect('/dashboard/teacher');
}
