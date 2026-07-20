import { lazy, Suspense, type ComponentType } from "react";
import type { RouteComponentProps } from "wouter";

function lazyRoute(
  importer: () => Promise<{ default: ComponentType<any> }>,
): ComponentType<any> {
  const Lazy = lazy(importer);
  return (props: any) => (
    <Suspense fallback={null}>
      <Lazy {...props} />
    </Suspense>
  );
}

// Compile-time contract: the lazy wrapper must remain assignable to both static
// and parameterized Wouter routes. No runtime code is emitted by verification.
const StaticRoute = lazyRoute(async () => ({ default: () => null }));
const DynamicRoute = lazyRoute(async () => ({
  default: (_props: RouteComponentProps<{ slug: string }>) => null,
}));

const staticContract: ComponentType<RouteComponentProps> = StaticRoute;
const dynamicContract: ComponentType<RouteComponentProps<{ slug: string }>> = DynamicRoute;

void staticContract;
void dynamicContract;
