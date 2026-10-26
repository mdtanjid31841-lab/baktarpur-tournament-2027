 "use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Registration = {
  id: string; created_at: string; team_name: string; area: string; manager_name: string;
  phone: string; players: string; payment_method: string; transaction_id: string;
  notes: string | null; status: "pending"|"approved"|"rejected";
};

export default function AdminPage() {
  const [email,setEmail] = useState("");
  const [password,setPassword] = useState("");
  const [user,setUser] = useState<string|null>(null);
  const [rows,setRows] = useState<Registration[]>([]);
  const [statusFilter,setStatusFilter] = useState("all");
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  const [ready,setReady] = useState(false);

  async function loadRows() {
    if (!supabase) return;
    const {data,error} = await supabase.from("registrations").select("*").order("created_at",{ascending:false});
    if (error) setError("তালিকা লোড হয়নি। আপনার অ্যাডমিন অনুমতি ও ডেটাবেস সেটআপ যাচাই করুন।");
    else setRows((data || []) as Registration[]);
  }
  useEffect(() => {
    if (!supabase) { setReady(true); return; }
    supabase.auth.getSession().then(async ({data}) => {
      const current = data.session?.user;
      if (current) { setUser(current.email || "Admin"); await loadRows(); }
      setReady(true);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_event,session) => {
      setUser(session?.user?.email || null);
      if (!session) setRows([]);
      else setTimeout(() => { void loadRows(); },0);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function login(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!supabase) { setError("ডেটাবেস কনফিগার করা হয়নি।"); return; }
    setBusy(true);
    const {error} = await supabase.auth.signInWithPassword({email,password});
    setBusy(false);
    if (error) setError("লগইন হয়নি। ইমেইল/পাসওয়ার্ড এবং Supabase সেটআপ যাচাই করুন।");
  }
  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setUser(null); setRows([]);
  }
  async function updateStatus(id:string,status:"approved"|"rejected"|"pending") {
    if (!supabase) return;
    setError("");
    const {error} = await supabase.from("registrations").update({status}).eq("id",id);
    if (error) setError("পরিবর্তন করা যায়নি। অ্যাডমিন অনুমতি যাচাই করুন।");
    else await loadRows();
  }
  const shown = rows.filter(r => statusFilter==="all" || r.status===statusFilter);
  const counts = {all:rows.length,pending:rows.filter(r=>r.status==="pending").length,approved:rows.filter(r=>r.status==="approved").length,rejected:rows.filter(r=>r.status==="rejected").length};
  return <main className="wrap admin-layout">
    <header className="nav"><Link href="/" className="brand"><Image src="/bft-logo.jpg" alt="Baktarpur Football Tournament logo" width={52} height={52} className="brand-logo" /><span>টুর্নামেন্ট অ্যাডমিন</span></Link><Link href="/" className="btn btn-secondary">হোমপেজ</Link></header>
    {!ready ? <p className="empty">লোড হচ্ছে…</p> : !user ? <section className="form-shell">
      <h1>অ্যাডমিন লগইন</h1><p>শুধু অনুমোদিত অ্যাডমিন অ্যাকাউন্ট ব্যবহার করুন।</p>
      {!supabase && <p className="error">Supabase সেটআপ করা হয়নি। README.md অনুসরণ করুন।</p>}
      {error && <p className="error" role="alert">{error}</p>}
      <form className="panel" onSubmit={login}>
        <div className="field"><label htmlFor="email">অ্যাডমিন ইমেইল</label><input id="email" type="email" autoComplete="username" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
        <div className="field" style={{marginTop:14}}><label htmlFor="password">পাসওয়ার্ড</label><input id="password" type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required/></div>
        <button className="primary" type="submit" disabled={busy || !supabase} style={{marginTop:18,width:"100%"}}>{busy?"লগইন হচ্ছে…":"লগইন করুন"}</button>
      </form>
    </section> : <section>
      <div className="admin-top"><div><h1>নিবন্ধন পরিচালনা</h1><p className="muted">{user} • পেমেন্ট হাতে যাচাই করে স্ট্যাটাস পরিবর্তন করুন।</p></div><div className="actions"><button className="btn-secondary" onClick={()=>void loadRows()}>রিফ্রেশ</button><button className="btn-secondary" onClick={()=>void logout()}>লগআউট</button></div></div>
      {error && <p className="error">{error}</p>}
      <div className="stats">
        <div className="stat"><span>মোট আবেদন</span><strong>{counts.all}</strong></div><div className="stat"><span>যাচাই বাকি</span><strong>{counts.pending}</strong></div><div className="stat"><span>অনুমোদিত</span><strong>{counts.approved}</strong></div>
      </div>
      <div className="panel">
        <div className="admin-top" style={{marginBottom:14}}><h2 style={{margin:0}}>দলের তালিকা</h2><select aria-label="স্ট্যাটাস ফিল্টার" value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{background:"#08130f",color:"var(--text)",border:"1px solid var(--line)",padding:10,borderRadius:10}}><option value="all">সব আবেদন</option><option value="pending">যাচাই বাকি</option><option value="approved">অনুমোদিত</option><option value="rejected">বাতিল</option></select></div>
        {shown.length===0 ? <div className="empty">এখনো কোনো নিবন্ধন পাওয়া যায়নি।</div> : <div className="table-wrap"><table className="table"><thead><tr><th>দল / এলাকা</th><th>ম্যানেজার / ফোন</th><th>খেলোয়াড়</th><th>পেমেন্ট</th><th>স্ট্যাটাস</th><th>অ্যাকশন</th></tr></thead><tbody>{shown.map(r=><tr key={r.id}><td><b>{r.team_name}</b><br/><span className="muted small">{r.area}</span><br/><span className="muted small">{new Date(r.created_at).toLocaleString("bn-BD")}</span></td><td>{r.manager_name}<br/><span className="muted">{r.phone}</span></td><td style={{whiteSpace:"pre-wrap",minWidth:180}}>{r.players}</td><td>{r.payment_method}<br/><b>{r.transaction_id}</b>{r.notes&&<p className="small muted">{r.notes}</p>}</td><td><span className="badge">{r.status==="pending"?"যাচাই বাকি":r.status==="approved"?"অনুমোদিত":"বাতিল"}</span></td><td><div style={{display:"grid",gap:6}}><button className="primary" onClick={()=>void updateStatus(r.id,"approved")}>অনুমোদন</button><button className="btn-secondary" onClick={()=>void updateStatus(r.id,"rejected")}>বাতিল</button><button className="btn-secondary" onClick={()=>void updateStatus(r.id,"pending")}>পেন্ডিং</button></div></td></tr>)}</tbody></table></div>}
      </div>
      <p className="hint" style={{marginTop:14}}>সতর্কতা: পেমেন্টের ট্রানজেকশন আইডি মিলিয়ে নেওয়ার পরই অনুমোদন দিন।</p>
    </section>}
    <footer className="footer">নিরাপত্তা: অ্যাডমিন অ্যাক্সেস ডেটাবেসের Row Level Security নীতির মাধ্যমে নিয়ন্ত্রিত।</footer>
  </main>;
}