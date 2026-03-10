import { HomeLayout } from 'fumadocs-ui/layouts/home';
import type { ReactNode } from 'react';

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <HomeLayout
      nav={{
        title: 'Claude Craft',
      }}
      links={[
        {
          text: 'Prompts',
          url: '/docs',
        },
        {
          text: 'Skills',
          url: '/skills',
        },
        {
          text: 'Workflows',
          url: '/workflows',
        },
        {
          text: 'GitHub',
          url: 'https://github.com/arthumusic/prompts',
          external: true,
        },
      ]}
    >
      {children}
    </HomeLayout>
  );
}
