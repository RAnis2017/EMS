import React, { useEffect, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import { 
  ArrowDownOutlined, 
  ArrowUpOutlined, 
  UserOutlined, 
  AlertOutlined, 
  NotificationOutlined,
  LaptopOutlined,
  ExclamationCircleOutlined
 } from '@ant-design/icons';
import { Card, Col, Row, Statistic, Space, Table, Tag } from 'antd';
import './AdminDashboard.css'

function AdminDashboard(props) {
  const navigate = useNavigate()
  useEffect(() => {
    if (!props.token) {
      const isAdmin = localStorage.getItem('isAdmin')
      if (!isAdmin) {
        navigate("/login")
      }
    }
  }, [])

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

  return (
    <div className="site-statistic-demo-card">
      <Row gutter={16}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={428}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Inactive Users"
              value={1224}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
              suffix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Pending Actions"
              value={21}
              valueStyle={{ color: '#f16012' }}
              prefix={<AlertOutlined />}
              suffix={<NotificationOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Equipment Requests"
              value={11}
              valueStyle={{ color: '#216012' }}
              prefix={<ExclamationCircleOutlined />}
              suffix={<LaptopOutlined />}
            />
          </Card>
        </Col>
      </Row>
      <Row gutter={16} style={{ marginTop: 12 }}>
        <Col span={24}>
          <Table columns={columns} dataSource={data} />
        </Col>
      </Row>
    </div>
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