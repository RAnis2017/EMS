import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
  ArrowUpOutlined,
  UserOutlined,
  AlertOutlined,
  NotificationOutlined,
  LaptopOutlined,
  ExclamationCircleOutlined,
  DownOutlined
} from '@ant-design/icons';
import { Card, Col, Row, Statistic, Space, Menu, Dropdown, Tag, Calendar, Popover } from 'antd';
import './AdminDashboard.css'
import { useQuery } from "react-query";

function AdminDashboard(props) {
  const navigate = useNavigate()
  const [popUpVisible, setPopUpVisible] = useState([])
  useEffect(() => {
    if (!props.token) {
      const isAdmin = localStorage.getItem('isAdmin')
      if (!isAdmin) {
        navigate("/login")
      }
    }
  }, [])

  const { isLoading: statsLoading, data: statsData } = useQuery('stats', () =>
    fetch('http://localhost:3001/admin/get-stats', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': localStorage.getItem('token')
      }
    }).then(res =>
      res.json()
    )
  )

  const { isLoading: calendarsLoading, data: calendarData } = useQuery('calendars', () =>
    fetch('http://localhost:3001/admin/get-calendars', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': localStorage.getItem('token')
      }
    }).then(res =>
      res.json()
    ), {
    onSuccess: (data) => {
      data?.data?.forEach((item) => {
        if (item.date) {
          setPopUpVisible(prev => [...prev, { key: item.date, open: false }])
        }
      })
    }
  }
  )

  const { isLoading: employeesLoading, data: employeesData } = useQuery('employees', () =>
    fetch('http://localhost:3001/admin/get-employees', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': localStorage.getItem('token')
      }
    }).then(res =>
      res.json()
    ), {
    onSuccess: () => {

    }
  }
  )

  const columns = [
    {
      title: 'Alert Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <a>{text}</a>,
    },
    {
      title: 'Alert Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Alert Target',
      dataIndex: 'target',
      key: 'target',
    },
    {
      title: 'Sent',
      dataIndex: 'sent',
      key: 'sent',
    },
    {
      title: 'Tags',
      key: 'tags',
      dataIndex: 'tags',
      render: (_, { tags }) => (
        <>
          {tags.map((tag) => {
            let color = tag.length > 8 ? 'geekblue' : 'green';
            if (tag === 'urgent') {
              color = 'volcano';
            }
            return (
              <Tag color={color} key={tag}>
                {tag.toUpperCase()}
              </Tag>
            );
          })}
        </>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a>Send Email</a>
          <a>Send SMS</a>
          <a>Delete</a>
        </Space>
      ),
    },
  ];
  const data = [
    {
      key: '1',
      name: 'Congratulations on Joining the Team!',
      type: 'New Hire',
      target: 'Jim Brown',
      sent: 'Yes',
      tags: ['New Hire', 'System Alert'],
    },
    {
      key: '2',
      name: 'PTO Approved!',
      type: 'PTO Approval',
      target: 'Tim Howard',
      sent: 'Yes',
      tags: ['System Alert'],
    },
    {
      key: '3',
      name: 'New Equipment Request',
      type: 'Equipment Request',
      target: 'Equipment Manager',
      sent: 'No',
      tags: ['Request Alert', 'Equipment', 'Urgent'],
    },
  ];



  const getListData = (value) => {
    let listData = [];

    calendarData?.data?.forEach((item) => {
      if (item.date === value.format('DD/MM/YYYY')) {
        // startTime get time only
        let startTime = item.startTime;
        startTime = new Date(startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        listData.push({
          ...item,
          startTimeFormatted: startTime,
        })
      }
    })

    return listData || [];
  };

  const getMonthData = (value) => {
    if (value.month() === 8) {
      return 1394;
    }
  };

  const monthCellRender = (value) => {
    const num = getMonthData(value);
    return null
  };

  const createReview = (record) => {
    navigate(`/admin/reviews/${record.developerName}/${record.date.replace(/\//g, '-')}`)
  }

  const reschedule = (record) => {
    navigate(`/admin/schedular/${record.key}`)
  }

  const items = (record) => {
    return [
      {
        key: '2',
        label: (
          <a onClick={() => createReview(record)}>
            Create Review
          </a>
        )
      },
      {
        key: '3',
        label: (
          <a onClick={() => reschedule(record)}>
            Reschedule
          </a>
        )
      }
    ]
  };

  const menu = (items) => (
    <Menu items={items} />
  );

  const togglePopUp = (key) => {
    const showPopUp = popUpVisible.find(item => item.key === key)
    if (showPopUp) {
      let newPopUpVisible = popUpVisible.filter(item => item.key === key)
      newPopUpVisible[0].open = !newPopUpVisible[0].open
      setPopUpVisible(prev => [...prev, newPopUpVisible[0]])
    } else {
      setPopUpVisible(prev => [...prev, { key, open: true }])
    }
  }

  const dateCellRender = (value) => {
    const listData = getListData(value);
    const showPopUp = popUpVisible.find(item => item.key === value.format('DD/MM/YYYY'))
    const content = (
      <div>
        {
          listData.map((item) => (
            <div key={item.key} className="hover:bg-gray-600 hover:text-white p-2 rounded-md" onClick={() => console.log(item)}>

              {item.manager} & {item.sportingManager} Meeting with <span className="text-blue-600">{item.developerName}</span> @  <span className="text-yellow-600">{item.startTimeFormatted}</span>

              <Dropdown overlay={menu(items(item))} className="ml-5">
                <a onClick={e => e.preventDefault()}>
                  <Space>
                    Actions
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
            </div>
          ))
        }
      </div>
    )

    if (listData.length > 0) {
      // debugger
    }
    return (
      <ul className="events">
        {listData?.length > 0 && <span className="bg-red-400 p-1 rounded mb-1 text-white">{listData?.length} Meetings</span>}
        {listData?.length > 0 &&
          <li key={listData[0]?.key} className="hover:bg-gray-600 hover:text-white p-2 rounded-md">
            {listData[0]?.manager} & {listData[0]?.sportingManager} Meeting with {listData[0]?.developerName} @ {listData[0]?.startTimeFormatted}

            {
              listData.length <= 1 &&
              <Dropdown overlay={menu(items(listData[0]))} className="ml-5">
                <a onClick={e => e.preventDefault()}>
                  <Space>
                    Actions
                    <DownOutlined />
                  </Space>
                </a>
              </Dropdown>
            }


          </li>
        }

        {
          listData.length > 1 &&
          <div className="flex flex-end justify-center">
            <Popover content={content} title={`All ${value.format('DD, dddd')} Events`} trigger="click" open={showPopUp?.open} />
            <button onClick={() => togglePopUp(showPopUp?.key)} className="btn btn-xs btn-ghost font-bold">{showPopUp?.open ? 'Close' : '...'}</button>
          </div>
        }

      </ul>
    );
  };

  return (
    <>
      <h1 className="text-lg -mt-2">Welcome To Dashboard</h1>
      <div className="site-statistic-demo-card">
        <Row gutter={16}>
          <Col span={6}>
            <Card>
              <Statistic
                title="Users"
                value={statsData?.users}
                valueStyle={{ color: '#3f8600' }}
                prefix={<ArrowUpOutlined />}
                suffix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Developers"
                value={statsData?.developers}
                valueStyle={{ color: '#cf1322' }}
                prefix={<ArrowUpOutlined />}
                suffix={<UserOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Today's Meetings"
                value={statsData?.meetings}
                valueStyle={{ color: '#f16012' }}
                prefix={<AlertOutlined />}
                suffix={<NotificationOutlined />}
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card>
              <Statistic
                title="Today's Reviews"
                value={statsData?.reviews}
                valueStyle={{ color: '#216012' }}
                prefix={<ExclamationCircleOutlined />}
                suffix={<LaptopOutlined />}
              />
            </Card>
          </Col>
        </Row>
        <Row gutter={16} style={{ marginTop: 12 }}>
          <Col span={24}>
            <Calendar dateCellRender={dateCellRender} monthCellRender={monthCellRender} />
          </Col>
        </Row>
      </div>
    </>

  )
}

const mapStateToProps = state => {
  return {
    token: state.appState.token,
  }
}

const mapDispatchToProps = dispatch => {
  return {

  }
}

export default connect(mapStateToProps, mapDispatchToProps)(AdminDashboard)