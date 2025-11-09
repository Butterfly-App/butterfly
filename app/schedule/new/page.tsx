import { Suspense } from 'react';
import NewScheduleClient from './NewScheduleClient';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

type PageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function Page({ searchParams }: PageProps) {
  const initialStart =
    typeof searchParams.start_time === 'string' ? searchParams.start_time : undefined;
  const initialEnd =
    typeof searchParams.end_time === 'string' ? searchParams.end_time : undefined;

  return (
    <Suspense fallback={null}>
      <NewScheduleClient initialStartISO={initialStart} initialEndISO={initialEnd} />
    </Suspense>
  );
}
