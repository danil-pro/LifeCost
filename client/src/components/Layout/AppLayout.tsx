import React from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useUIStore } from '../../store/uiStore';

const LayoutWrapper = styled.div`
  display: flex;
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background};
`;

const SidebarContainer = styled.div<{ $open: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 260px;
  z-index: 100;
  transform: translateX(${({ $open }) => ($open ? '0' : '-100%')});
  transition: transform 0.3s ease;

  @media (min-width: 992px) {
    transform: translateX(0);
    position: relative;
  }
`;

const SidebarOverlay = styled.div<{ $open: boolean }>`
  display: ${({ $open }) => ($open ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 99;

  @media (min-width: 992px) {
    display: none;
  }
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-left: 0;

  @media (min-width: 992px) {
    margin-left: 0;
  }
`;

const ContentArea = styled.main`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.base};
  padding-bottom: calc(${({ theme }) => theme.spacing.xl} + 80px);

  @media (min-width: 480px) {
    padding: ${({ theme }) => theme.spacing.xl};
    padding-bottom: calc(${({ theme }) => theme.spacing.xxl} + 70px);
  }

  @media (min-width: 992px) {
    padding: ${({ theme }) => theme.spacing.xxl};
    padding-bottom: ${({ theme }) => theme.spacing.xxl};
  }
`;

export const AppLayout: React.FC = () => {
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  return (
    <LayoutWrapper>
      <SidebarOverlay $open={sidebarOpen} onClick={() => setSidebarOpen(false)} />
      <SidebarContainer $open={sidebarOpen}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </SidebarContainer>
      <MainContent>
        <Header />
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
      <MobileNav />
    </LayoutWrapper>
  );
};
