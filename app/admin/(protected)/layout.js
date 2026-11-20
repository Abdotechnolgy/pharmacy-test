import { redirect } from "next/navigation";
import { getAdminUser } from "../../../lib/adminAuth";
import { ToastProvider } from "../../../components/admin/Toast";
import AdminShell from "../../../components/admin/AdminShell";

export const metadata = {
  title: "لوحة التحكم",
  robots: { index: false, follow: false, nocache: true },
};

// ده الفحص الحقيقي والمُعتمَد — بيحصل على السيرفر قبل ما أي محتوى إداري يترندر
// أو يوصل للمتصفح خالص. الـ middleware بيعمل تحويل سريع أولي (وجود cookie بس)،
// لكن التحقق الفعلي من صحة الجلسة ودور "admin" بيحصل هنا.
export default async function AdminLayout({ children }) {
  const user = await getAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <ToastProvider>
      <AdminShell>{children}</AdminShell>
    </ToastProvider>
  );
}
