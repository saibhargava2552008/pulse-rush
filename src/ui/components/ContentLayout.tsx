import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  pageTitle?: string;
}

export function ContentLayout({ children, pageTitle }: Props) {
  return (
    <main className="content-layout" id="main-content" tabIndex={-1}>
      <div className="content-container">
        {pageTitle && <h1 className="content-heading sr-only">{pageTitle}</h1>}
        {children}
      </div>
    </main>
  );
}
