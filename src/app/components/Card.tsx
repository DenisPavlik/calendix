import { Check } from "lucide-react";
import Link from "next/link";

type CardProps = {
  title: string;
  subtitle: string;
  monthlyPrice: string;
  yearlyPrice: string;
  billing: "monthly" | "yearly";
  features: string[];
  featuresLabel: string;
  popular?: boolean;
};

export default function Card({
  title,
  subtitle,
  monthlyPrice,
  yearlyPrice,
  billing,
  features,
  featuresLabel,
  popular,
}: CardProps) {
  const price = billing === "yearly" ? yearlyPrice : monthlyPrice;
  const isFree = monthlyPrice === "Free";

  return (
    <div
      className={`relative rounded-2xl p-8 flex flex-col ${
        popular
          ? "bg-blue-600 text-white shadow-xl shadow-blue-200 scale-[1.03]"
          : "bg-white border border-gray-100 shadow-sm"
      }`}
    >
      {popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
          <span className="bg-white text-blue-600 text-xs font-bold px-4 py-1.5 rounded-full shadow-md whitespace-nowrap">
            Most popular
          </span>
        </div>
      )}

      {/* Title */}
      <div className="mb-6">
        <h2
          className={`font-bold text-xl mb-1 ${
            popular ? "text-white" : "text-gray-900"
          }`}
        >
          {title}
        </h2>
        <p className={`text-sm ${popular ? "text-blue-100" : "text-gray-500"}`}>
          {subtitle}
        </p>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-end gap-1">
          <span
            className={`text-4xl font-bold ${
              popular ? "text-white" : "text-gray-900"
            }`}
          >
            {price}
          </span>
          {!isFree && (
            <span
              className={`text-sm mb-1.5 ${
                popular ? "text-blue-100" : "text-gray-400"
              }`}
            >
              / mo
            </span>
          )}
        </div>
        {!isFree && billing === "yearly" && (
          <p
            className={`text-xs mt-1 ${
              popular ? "text-blue-100" : "text-gray-400"
            }`}
          >
            Billed annually
          </p>
        )}
      </div>

      {/* CTA */}
      <Link
        href="/dashboard"
        className={`btn justify-center mb-8 ${
          popular
            ? "bg-white text-blue-600 hover:bg-blue-50"
            : "btn-primary"
        }`}
      >
        Get started
      </Link>

      {/* Features */}
      <p
        className={`text-xs font-semibold uppercase tracking-wide mb-4 ${
          popular ? "text-blue-100" : "text-gray-400"
        }`}
      >
        {featuresLabel}
      </p>
      <ul className="flex flex-col gap-3">
        {features.map((text) => (
          <li key={text} className="flex items-start gap-3">
            <span
              className={`mt-0.5 shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${
                popular ? "bg-white/20" : "bg-blue-50"
              }`}
            >
              <Check
                size={10}
                className={popular ? "text-white" : "text-blue-600"}
              />
            </span>
            <span
              className={`text-sm leading-snug ${
                popular ? "text-blue-50" : "text-gray-600"
              }`}
            >
              {text}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
