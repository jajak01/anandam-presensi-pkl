"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatDateIndo } from "@/lib/format";
import Modal from "@/app/(dashboard)/components/Modal";

type IzinRequest = {
  id: number;
  user_id: number;
  nama: string;
  username: string;
  tanggal_mulai: string;
  jam_mulai: string;
  tanggal_selesai: string;
  jam_selesai: string;
  alasan: string;
  status: string;
  foto_bukti: string | null;
  created_at: string;
  updated_at: string;
};

export default function AdminIzinPage() {
  const [izinRequests, setIzinRequests] = useState<IzinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [action, setAction] = useState<"APPROVE" | "REJECT" | null>(null);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [fotoBukti, setFotoBukti] = useState<string | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  useEffect(() => {
    fetchIzinRequests();
  }, []);

  const fetchIzinRequests = async () => {
    try {
      const res = await fetch("/api/admin/izin");
      const data = await res.json();
      setIzinRequests(data.izin_requests || []);
    } catch (error) {
      console.error("Error fetching izin requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedId) return;

    try {
      const res = await fetch("/api/admin/izin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedId,
          status: "APPROVED",
          foto_bukti: fotoBukti || null,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Gagal mengapprove izin" });
        return;
      }

      setMessage({ type: "ok", text: data.message ?? "Izin berhasil disetujui" });
      setTimeout(() => {
        setSelectedId(null);
        setAction(null);
        setFotoBukti(null);
        setMessage(null);
        fetchIzinRequests();
      }, 1500);
    } catch (error) {
      setMessage({ type: "err", text: "Koneksi gagal" });
    }
  };

  const handleReject = async () => {
    if (!selectedId) return;

    try {
      const res = await fetch("/api/admin/izin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedId,
          status: "REJECTED",
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage({ type: "err", text: data.error ?? "Gagal menolak izin" });
        return;
      }

      setMessage({ type: "ok", text: data.message ?? "Izin berhasil ditolak" });
      setTimeout(() => {
        setSelectedId(null);
        setAction(null);
        setMessage(null);
        fetchIzinRequests();
      }, 1500);
    } catch (error) {
      setMessage({ type: "err", text: "Koneksi gagal" });
    }
  };

  const openActionModal = (id: number, status: "APPROVE" | "REJECT") => {
    setSelectedId(id);
    setAction(status);
    setMessage(null);
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Memuat data izin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-slide-up w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Manajemen Izin</h1>
          <p className="mt-1 text-slate-500">Kelola dan tinjau permintaan izin ganti hari mahasiswa.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="inline-flex items-center rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>

      {izinRequests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <div className="mb-4 rounded-full bg-slate-100 p-4">
            <svg className="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900">Belum ada permintaan</h3>
          <p className="mt-1 text-sm text-slate-500">Semua permintaan izin akan muncul di sini.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {izinRequests.map((request) => (
            <div
              key={request.id}
              className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all hover:shadow-md ${
                request.status === "PENDING"
                  ? "border-amber-100"
                  : request.status === "APPROVED"
                  ? "border-emerald-100"
                  : "border-rose-100"
              }`}
            >
              {/* Status Banner */}
              <div
                className={`h-1.5 w-full ${
                  request.status === "PENDING"
                    ? "bg-amber-400"
                    : request.status === "APPROVED"
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}
              />

              <div className="p-5">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full text-lg font-bold ${
                      request.status === "PENDING" ? "bg-amber-100 text-amber-700" :
                      request.status === "APPROVED" ? "bg-emerald-100 text-emerald-700" :
                      "bg-rose-100 text-rose-700"
                    }`}>
                      {request.nama.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{request.nama}</h3>
                      <p className="text-xs font-medium text-slate-500">@{request.username}</p>
                    </div>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ring-1 ring-inset ${
                      request.status === "PENDING"
                        ? "bg-amber-50 text-amber-700 ring-amber-200"
                        : request.status === "APPROVED"
                        ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                        : "bg-rose-50 text-rose-700 ring-rose-200"
                    }`}
                  >
                    {request.status === "PENDING" ? "Menunggu" : request.status === "APPROVED" ? "Disetujui" : "Ditolak"}
                  </span>
                </div>

                <div className="mb-4 space-y-2.5">
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Periode Izin</span>
                      <span className="font-semibold text-slate-700">
                        {formatDateIndo(request.tanggal_mulai)} - {formatDateIndo(request.tanggal_selesai)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2.5 text-sm text-slate-600">
                    <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Waktu</span>
                      <span className="font-semibold text-slate-700">{request.jam_mulai} - {request.jam_selesai}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Alasan</span>
                  <p className="mt-1 text-sm text-slate-600 line-clamp-2">{request.alasan}</p>
                </div>

                {request.foto_bukti && (
                  <div className="mb-4">
                    <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-wider text-slate-400">Bukti Foto</span>
                    <div
                      onClick={() => setPreviewImage(request.foto_bukti)}
                      className="group relative cursor-zoom-in overflow-hidden rounded-xl border border-slate-200 bg-slate-50 transition hover:border-blue-300"
                    >
                      <img
                        src={request.foto_bukti}
                        alt="Bukti"
                        className="h-24 w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/20 group-hover:opacity-100">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex items-center justify-between border-t border-slate-50 pt-4">
                  <span className="text-[10px] font-medium text-slate-400 italic">
                    Diajukan pada {new Date(request.created_at).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}
                  </span>
                  {request.status === "PENDING" && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => openActionModal(request.id, "REJECT")}
                        className="rounded-lg bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-600 transition hover:bg-rose-100 active:scale-95"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => openActionModal(request.id, "APPROVE")}
                        className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-blue-700 active:scale-95 shadow-sm shadow-blue-200"
                      >
                        Setujui
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Image Preview Modal */}
      <Modal open={!!previewImage} onClose={() => setPreviewImage(null)}>
        <div className="relative -m-6 overflow-hidden rounded-2xl">
          <img src={previewImage || ""} alt="Preview Bukti" className="h-auto w-full" />
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute right-4 top-4 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </Modal>

      {/* Action Modal */}
      <Modal open={!!selectedId && !!action} onClose={() => { setSelectedId(null); setAction(null); }}>
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 items-center justify-center rounded-full ${action === "APPROVE" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"}`}>
              {action === "APPROVE" ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {action === "APPROVE" ? "Setujui Permintaan" : "Tolak Permintaan"}
            </h3>
          </div>

          <p className="text-sm text-slate-600">
            Apakah Anda yakin ingin {action === "APPROVE" ? "menyetujui" : "menolak"} permintaan izin dari{" "}
            <span className="font-bold text-slate-800">
              {izinRequests.find((r) => r.id === selectedId)?.nama}
            </span>?
          </p>

          {message && (
            <div className={`rounded-xl px-4 py-3 text-sm font-medium animate-shake ${message.type === "ok" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"}`}>
              {message.text}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              onClick={() => { setSelectedId(null); setAction(null); }}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 font-bold text-slate-600 transition hover:bg-slate-50 active:scale-95"
            >
              Batal
            </button>
            <button
              onClick={action === "APPROVE" ? handleApprove : handleReject}
              disabled={!!message && message.type === "ok"}
              className={`flex-[1.5] rounded-xl px-4 py-2.5 font-bold text-white shadow-lg transition active:scale-95 disabled:opacity-50 ${
                action === "APPROVE" ? "bg-blue-600 hover:bg-blue-700 shadow-blue-200" : "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
              }`}
            >
              {action === "APPROVE" ? "Ya, Setujui" : "Ya, Tolak"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
