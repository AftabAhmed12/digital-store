import { useEffect, useState } from "react";
import api from "../../api/axios.js";
import Loader from "../../components/Loader.jsx";
import Pagination from "../../components/Pagination.jsx";

const PAGE_SIZE = 10;

export default function AdminChatLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  useEffect(() => {
    setLoading(true);
    api
      .get("/chat/admin/leads", { params: { page, limit: PAGE_SIZE } })
      .then((res) => {
        setLeads(res.data.data);
        setTotal(res.data.total);
        setTotalPages(res.data.totalPages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const copyEmail = (email) => {
    navigator.clipboard?.writeText(email);
  };

  if (loading) return <Loader />;

  return (
    <div className="container-px py-10 max-w-6xl">
      <div className="flex items-center justify-between mb-2">
        <h1 className="font-display font-700 text-2xl">Chat Leads</h1>
        <span className="text-xs text-text-faint font-mono">{leads.length} emails captured</span>
      </div>
      <p className="text-text-faint text-sm mb-8">
        Visitors who started a chat and left their email — ideal for follow-up outreach.
      </p>

      <div className="bg-surface border border-border rounded-xl overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[860px]">
          <thead>
            <tr className="border-b border-border text-text-faint text-left">
              <th className="p-4">Email</th>
              <th className="p-4">Questions</th>
              <th className="p-4">Msgs</th>
              <th className="p-4">First seen</th>
              <th className="p-4">Last seen</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l._id} className="border-b border-border last:border-0 align-top">
                <td className="p-4 text-text-muted">{l.email}</td>
                <td className="p-4 text-text-faint whitespace-pre-line">
                  {l.questions?.length
                    ? l.questions.map((q) => `• ${q}`).join("\n")
                    : "—"}
                </td>
                <td className="p-4">{l.messageCount ?? 0}</td>
                <td className="p-4 text-text-faint">{new Date(l.firstSeenAt).toLocaleString()}</td>
                <td className="p-4 text-text-faint">{new Date(l.lastSeenAt).toLocaleString()}</td>
                <td className="p-4 text-right whitespace-nowrap">
                  <button
                    onClick={() => copyEmail(l.email)}
                    className="text-blue hover:underline"
                    title="Copy email"
                  >
                    Copy email
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {leads.length === 0 && (
          <p className="p-8 text-center text-text-faint">No chat leads yet — visitors have to open the chat widget on your site.</p>
        )}
        <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} pageSizeLabel={PAGE_SIZE} />
      </div>
    </div>
  );
}