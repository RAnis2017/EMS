import React, { useEffect, useState } from "react"
import "./App.css"
import { connect } from "react-redux"
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
  useNavigate,
  useLocation
} from "react-router-dom";
import Login from "./Pages/Login";
import AdminDashboard from "./Pages/AdminDashboard";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useGoogleLogout } from "react-google-login";
import io from 'socket.io-client';
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  CodeSandboxOutlined,
  SketchOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import { Layout, Menu } from 'antd';
import TechnologiesAdmin from "./Pages/TechnologiesAdmin";
import SkillsetAdmin from "./Pages/SkillsetAdmin";
import EmployeesAdmin from "./Pages/EmployeesAdmin";

const { Header, Sider, Content } = Layout;

const socket = io();

const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

const AppOutlet = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate()
  const location = useLocation()
  const onLogoutSuccess = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('username')
    localStorage.removeItem('admin')
    navigate('/')
  }

  const onFailure = (error) => {
    console.log(error)
  }

  const { signOut } = useGoogleLogout({
    clientId,
    onLogoutSuccess,
    onFailure,
  })

  return (
    <>
      <div>
        <Layout>
          <Sider trigger={null} collapsible collapsed={collapsed} theme="light">
            <div className="logo">
              <img src="https://www.kadencewp.com/wp-content/uploads/2020/10/alogo-2.png" height={120} width={120} alt="logo" />
            </div>
            <Menu
              theme="light"
              mode="inline"
              defaultSelectedKeys={['1']}
              items={[
                {
                  key: '1',
                  icon: <UserOutlined />,
                  label: 'Dashboard',
                  to: '/admin/dashboard',
                  onClick: () => navigate('/admin/dashboard')
                },
                {
                  key: '2',
                  icon: <CodeSandboxOutlined />,
                  label: 'Technologies',
                  to: '/admin/technologies',
                  onClick: () => navigate('/admin/technologies')
                },
                {
                  key: '3',
                  icon: <SketchOutlined />,
                  label: 'Skillsets',
                  to: '/admin/skillsets',
                  onClick: () => navigate('/admin/skillsets')
                },
                {
                  key: '4',
                  icon: <UsergroupAddOutlined />,
                  label: 'Developers',
                  to: '/admin/developers',
                  onClick: () => navigate('/admin/developers')
                },
                {
                  key: '5',
                  icon: <LogoutOutlined />,
                  label: 'Logout',
                  onClick: () => signOut()
                }
              ]}
            />
          </Sider>
          <Layout className="site-layout">
            <Header className="site-layout-background" style={{ padding: 0, background: '#fff' }}>
              {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                className: 'trigger',
                onClick: () => setCollapsed(!collapsed),
              })}

              {/* User avatar and name */}
              <span className="float-right mr-10">
                <img src="https://via.placeholder.com/400x400"
                  alt="alt placeholder" className="w-10 h-10 mb-2 rounded-full inline-block" />
                {/* <span className="mr-5">{localStorage.getItem('username')}</span> */}
                <span className="ml-2">{localStorage.getItem('email')}</span>
              </span>
            </Header>
            <Content
              className="site-layout-background"
              style={{
                margin: '24px 16px',
                padding: 24,
                minHeight: '100vh',
              }}
            >
              <Outlet />
            </Content>
          </Layout>
        </Layout>
      </div>
    </>
  );
};

function App() {

  return (
    <Router>
      <div className="min-h-screen bg-violet-100">

        <ToastContainer limit={1} />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppOutlet />}>
            <Route path="admin/dashboard" element={<AdminDashboard />} />
            <Route path="admin/technologies" element={<TechnologiesAdmin />} />
            <Route path="admin/skillsets" element={<SkillsetAdmin />} />
            <Route path="admin/developers" element={<EmployeesAdmin />} />
          </Route>
          <Route path="*" element={<Login />} />
        </Routes>
      </div>
    </Router>
  )
}

const mapStateToProps = state => {
  return {
    isLoggedIn: state.appState.isLoggedIn,
    email: state.appState.email,
    token: state.appState.token,
  }
}

const mapDispatchToProps = dispatch => {
  return {
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(App)