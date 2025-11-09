import { createClient } from "@/lib/supabase/server";
import ReportForm from "./report-form";


export default async function ViewReportPage() {

  const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // get list of all reports
    const { data: reporttitles, error } = await supabase
      .from('reports')
      .select('title')
    console.log('Fetched report titles:', error);
    if (error) {
      console.error('Error fetching reports:', error);
    }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="p-8">
        <h1 className="text-2xl font-bold mb-4">View Report Page</h1>
        <p className="mt-2 mb-6">Choose a report.</p>
        <ReportForm reporttitles={reporttitles || []} />
      </main>
    </div>
  );
}