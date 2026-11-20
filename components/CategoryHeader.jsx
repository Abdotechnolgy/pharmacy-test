import ProductVisual from "./ProductVisual";

// عنوان قسم/صفحة التصنيف. size="section" أصغر (يُستخدم داخل الصفحة الرئيسية)
// و"page" أكبر (يُستخدم في أعلى صفحة التصنيف المستقلة كـ H1).
// icon/image (اختياريين): بيظهروا كبانر صورة أعلى العنوان في صفحة التصنيف المستقلة بس.
export default function CategoryHeader({ title, description, count, size = "section", icon, image }) {
  const isPage = size === "page";
  const Heading = isPage ? "h1" : "h2";

  return (
    <div className={isPage ? "text-center sm:text-right" : "text-center"}>
      {isPage && (icon || image) && (
        <div className="mb-4 flex justify-center sm:justify-start">
          <ProductVisual icon={icon} image={image} alt={title} className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl" />
        </div>
      )}
      <Heading
        className={`font-display font-bold text-navy ${isPage ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"}`}
      >
        {title}
      </Heading>
      {description && (
        <p className={`text-navy/60 mt-2 ${isPage ? "max-w-xl mx-auto sm:mx-0" : "max-w-md mx-auto text-sm"}`}>
          {description}
        </p>
      )}
      {typeof count === "number" && (
        <p className="text-xs sm:text-sm text-emerald font-semibold mt-2">عدد المنتجات: {count}</p>
      )}
    </div>
  );
}
