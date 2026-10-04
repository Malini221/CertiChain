export const routerState = {
  setRoute: (path: string) => {}
};

export function navigateTo(path: string) {
  if (window.location.pathname + window.location.search !== path) {
    window.history.pushState({}, "", path);
  }
  routerState.setRoute(window.location.pathname);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
