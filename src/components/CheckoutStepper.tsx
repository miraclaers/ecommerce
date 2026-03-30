type Step = "cart" | "checkout" | "pay" | "success";

const steps: { id: Step; label: string }[] = [
  { id: "cart", label: "Cart" },
  { id: "checkout", label: "Checkout" },
  { id: "pay", label: "Pay" },
  { id: "success", label: "Success" },
];

export default function CheckoutStepper({
  currentStep,
}: {
  currentStep: Step;
}) {
  const currentIndex = steps.findIndex(
    (step) => step.id === currentStep
  );

  return (
    <ol className="mb-8 flex items-center gap-2 text-sm">
      {steps.map((step, index) => {
        const isComplete = index < currentIndex;
        const isActive = index === currentIndex;

        return (
          <li key={step.id} className="flex items-center gap-2">
            <span
              className={[
                "flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold",
                isComplete
                  ? "border-violet-600 bg-violet-600 text-white"
                  : isActive
                  ? "border-violet-600 text-violet-700 dark:text-violet-300"
                  : "border-zinc-300 text-zinc-400 dark:border-zinc-700 dark:text-zinc-500",
              ].join(" ")}
            >
              {index + 1}
            </span>

            <span
              className={[
                "font-medium",
                isComplete
                  ? "text-violet-600"
                  : isActive
                  ? "text-zinc-900 dark:text-zinc-100"
                  : "text-zinc-400 dark:text-zinc-500",
                "hidden sm:inline",
              ].join(" ")}
            >
              {step.label}
            </span>

            {index < steps.length - 1 && (
              <span
                className={[
                  "h-px w-6 sm:w-10",
                  isComplete
                    ? "bg-violet-600"
                    : "bg-zinc-300 dark:bg-zinc-700",
                ].join(" ")}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
