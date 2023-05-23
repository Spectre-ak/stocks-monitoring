import { Dashboard } from "./dashboard";
import { Settings } from "./settings";
import DashboardIcon from '@rsuite/icons/legacy/Dashboard';
import GearCircleIcon from '@rsuite/icons/legacy/GearCircle';
import { Sidenav, Nav, Sidebar, Container, Content } from 'rsuite';
import React, { useEffect } from "react";
import ExitIcon from '@rsuite/icons/Exit';
import { deleteUserSession } from "./utils";
import NavbarBrand from "rsuite/esm/Navbar/NavbarBrand";

const DashboardSidebar = ({ appearance, expanded, onExpand, ...navProps }) => {
  return (
    <Sidenav
      appearance={appearance}
      expanded={expanded}
    >
      <Sidenav.Body>
        <Nav {...navProps}>
          <Nav.Item eventKey="1" active icon={<DashboardIcon />}>
            Dashboard
          </Nav.Item>
          <Nav.Item eventKey="2" icon={<GearCircleIcon />}>
            Settings
          </Nav.Item>
          <Nav.Item eventKey="3" icon={<ExitIcon />}>
            Logout
          </Nav.Item>
        </Nav>
      </Sidenav.Body>
      <Sidenav.Toggle onToggle={onExpand} />
    </Sidenav>
  );
};

const DashboardPageHandler = (props) => {
  const [activeKey, setActiveKey] = React.useState('1');
  const [expanded, setExpand] = React.useState(true);
  const [pageContent, setPageContent] = React.useState('');

  useEffect(() => {
    if (activeKey === '1') {
      setPageContent(<Dashboard userInfo={props.userInfo} savedWatchlist={props.savedWatchlist} />)
    } else if (activeKey === '2') {
      setPageContent(<Settings />)
    } else if (activeKey === '3') {
      deleteUserSession();
      window.location.reload();
    }
  }, [activeKey])

  return (
    <>
      <Container>
        <Sidebar width={expanded ? 260 : 56}>

          <DashboardSidebar
            activeKey={activeKey}
            onSelect={setActiveKey}
            expanded={expanded}
            onExpand={setExpand}
            appearance="subtle"
          />
        </Sidebar>

        <Container className="page-container">
          <Content>
            {pageContent}
          </Content>
        </Container>
      </Container>
    </>
  );
};

export { DashboardSidebar, DashboardPageHandler };