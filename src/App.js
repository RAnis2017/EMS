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
import 'antd/dist/antd.css'; // or 'antd/dist/antd.less'
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  LogoutOutlined,
  CodeSandboxOutlined,
  SketchOutlined,
  UsergroupAddOutlined,
  FileSearchOutlined,
  ClockCircleOutlined,
  BellFilled
} from '@ant-design/icons';
import { Layout, Menu, Dropdown, Space } from 'antd';
import TechnologiesAdmin from "./Pages/TechnologiesAdmin";
import SkillsetAdmin from "./Pages/SkillsetAdmin";
import EmployeesAdmin from "./Pages/EmployeesAdmin";
import UsersAdmin from "./Pages/UsersAdmin";
import ReviewsAdmin from "./Pages/ReviewsAdmin";
import CalendarAdmin from "./Pages/CalendarAdmin";
import { useMutation, useQuery } from "react-query";

const onClick = ({ key }) => {
  console.log(`click ${key}`);
};

const { Header, Sider, Content } = Layout;

const clientId = '874157957573-9ghj35jep265q5u0ksfjr5mm22qmbb1k.apps.googleusercontent.com'

const AppOutlet = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate()
  const { isLoading: calendarsLoading, data: calendarData } = useQuery('calendars-1', () =>
    fetch('http://localhost:3001/admin/get-calendars?current=1', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': localStorage.getItem('token')
      }
    }).then(res =>
      res.json()
    ),
    {
      onSuccess: (data) => {
        let items = []

        if(data?.data?.length > 0) {
          items = data.data.map((calendar, index) => {
            let startTime = new Date(calendar.startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

            return {
              key: calendar.key,
              seen: calendar.seen,
              label: (
                <p>You have an upcoming meeting with <span className="text-blue-600">{calendar.developerName}</span> @  <span className="text-yellow-600">{startTime}</span></p>
              )
            }
          })
        } else {
          items = [
            {
              key: 'no-calendar',
              label: (
                <p>You have no upcoming meetings</p>
              )
            }
          ]
        }

        setItems(items)
      }
    }
  )

  // post request to server to set notification as read react query
  const { mutate: setNotificationAsRead } = useMutation('set-notification-as-read', (calendarIds) =>
    fetch('http://localhost:3001/admin/set-notifications', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': localStorage.getItem('token')
      },
      body: JSON.stringify({
        calendarIds
      })
    }).then(res =>
      res.json()
    ),
    {
      onSuccess: (data) => {
        console.log(data)
      }
    }
  )

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

  const [items, setItems] = useState([])

  const menu = (items) => {
    return <Menu items={items} />
  };

  const setNotifications = () => {
    let calendarIds = items.map(item => item.key)
    setNotificationAsRead(calendarIds)
  }

  const MENU_ITEMS = [
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
      icon: <UserOutlined />,
      label: 'Managers',
      to: '/admin/managers',
      onClick: () => navigate('/admin/managers')
    },
    {
      key: '6',
      icon: <FileSearchOutlined />,
      label: 'Reviews',
      to: '/admin/reviews',
      onClick: () => navigate('/admin/reviews')
    },
    {
      key: '7',
      icon: <ClockCircleOutlined />,
      label: 'Schedular',
      to: '/admin/schedular',
      onClick: () => navigate('/admin/schedular')
    },
    {
      key: '8',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: () => signOut()
    }
  ]

  const getCurrentItem = () => {
    let key = MENU_ITEMS.filter(item => item.to === location.pathname)[0]?.key
    return key ? [key] : []
  }

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
              defaultSelectedKeys={() => getCurrentItem()}
              items={MENU_ITEMS}
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
                <Dropdown overlay={menu(items)}>
                  {
                    items.length > 0 && items.filter(item => item.seen === false).length > 0 ?
                    <a onClick={e => setNotifications()} className="mr-4 text-lg bg-slate-100 rounded-md p-2 pb-3 mb-2">
                        <Space>
                          <BellFilled className={`${items.length > 0 && items[0].key !== 'no-calendar' ? 'animate-bounce' : ''}`} /> 
                          <span className="text-sm bg-green-400 font-bold text-white rounded-sm p-1">{items.length && items[0].key !== 'no-calendar' ? items.length : 0}</span>
                        </Space>
                    </a> :
                    <a onClick={e => e.preventDefault()} className="mr-4 text-lg bg-slate-100 rounded-md p-2 pb-3 mb-2">
                      <Space>
                        <BellFilled className={`${items.length > 0 && items[0].key !== 'no-calendar' ? '' : ''}`} /> 
                      </Space>
                    </a>
                  }
                    
                </Dropdown>
                <span className="">
                  <img src="https://via.placeholder.com/400x400"
                    alt="alt placeholder" className="w-10 h-10 mb-2 rounded-full inline-block" />
                  {/* <span className="mr-5">{localStorage.getItem('username')}</span> */}
                  <span className="ml-2">{localStorage.getItem('username')}</span>
                </span>
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
            <Route path="admin/managers" element={<UsersAdmin />} />
            <Route path="admin/reviews" element={<ReviewsAdmin />} />
            <Route path="admin/reviews/:developer/:date" element={<ReviewsAdmin />} />
            <Route path="admin/schedular" element={<CalendarAdmin />} />
            <Route path="admin/schedular/:id" element={<CalendarAdmin />} />
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