import React, { useEffect, useRef, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
    DownOutlined
} from '@ant-design/icons';
import { Space, Table, Dropdown, Button, Form, Input, Select, Menu, Tag, Row, Col, Alert, notification, Popconfirm } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useMutation, useQuery, useQueryClient } from 'react-query'

import './UsersAdmin.css'

const { Option } = Select;

function UsersAdmin(props) {
    const [showAddEditForm, setShowAddEditForm] = useState(false)
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const queryClient = useQueryClient()
    const [skills, setSkills] = useState([])
    const [errors, setErrors] = useState([])
    const [api, contextHolder] = notification.useNotification();
    const [managers, setManagers] = useState([])
    const [supportingManagers, setSupportingManagers] = useState([])
    const [filters, setFilters] = useState([])

    const openNotification = (type) => {
        let description = type === 'create' ? 'User created successfully' : 'User updated successfully'
        api.info({
            message: 'Action Successful',
            description,
            placement: 'topRight',
        });
    };

    const { isLoading: usersLoading, data: usersData } = useQuery('users', () =>
        fetch('http://localhost:3001/admin/get-users', {
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
        }
    })

    const { isLoading: addUserLoading, isSuccess: addUserSuccess, mutate: addUserMutate } = useMutation('add-users', (data) =>
        fetch('http://localhost:3001/admin/add-user', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        }).then(res =>
            res.json()
        ), {
        onSuccess: (data, variables, context) => {
            if (data.error) {
                if (data.error?.errors) {
                    let errors = data.error.errors
                    setErrors(errors)
                }
            } else {
                setErrors([])
                openNotification('create')
                setShowAddEditForm(false)
                form.resetFields()
                queryClient.invalidateQueries('users')
            }
        }
    }
    )

    const { isLoading: editUserLoading, isSuccess: editUserSuccess, mutate: editUserMutate } = useMutation('edit-employees', (data) =>
        fetch('http://localhost:3001/admin/update-user/' + data.key, {
            method: 'PUT',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        }).then(res =>
            res.json()
        ), {
        onSuccess: (data, variables, context) => {
            if (data.error) {
                if (data.error?.errors) {
                    let errors = data.error.errors
                    setErrors(errors)
                }
            } else {
                setErrors([])
                openNotification('update')
                setShowAddEditForm(false)
                form.resetFields()
                queryClient.invalidateQueries('users')
            }
        }
    }
    )

    const { isLoading: deleteUserLoading, isSuccess: deleteUserSuccess, mutate: deleteUserMutate } = useMutation('delete-user', (data) =>
        fetch('http://localhost:3001/admin/delete-user/' + data.key, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'x-access-token': localStorage.getItem('token')
            },
            body: JSON.stringify(data)
        }).then(res =>
            res.json()
        ), {
        onSuccess: (data, variables, context) => {
            setShowAddEditForm(false)
            form.resetFields()
            queryClient.invalidateQueries('users')
        }
    }
    )

    const handleSearch = (
        selectedKeys,
        confirm,
        dataIndex,
    ) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{ marginBottom: 8, display: 'block' }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm({ closeDropdown: false });
                            setSearchText((selectedKeys)[0]);
                            setSearchedColumn(dataIndex);
                        }}
                    >
                        Filter
                    </Button>
                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            confirm();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
        ),
        onFilter: (value, record) =>
            record[dataIndex]
                .toString()
                .toLowerCase()
                .includes((value).toLowerCase()),
        onFilterDropdownOpenChange: visible => {
            if (visible) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
        render: text =>
            searchedColumn === dataIndex ? (
                <Highlighter
                    highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                    searchWords={[searchText]}
                    autoEscape
                    textToHighlight={text ? text.toString() : ''}
                />
            ) : (
                text
            ),
    });

    const changeStatus = (record) => {
        if (record.status === 'Active') {
            record.status = 'Inactive'
        } else {
            record.status = 'Active'
        }
        editUserMutate(record)
    }

    const editRecord = (record) => {
        form.setFieldsValue({
            key: record.key,
            alias: record.alias,
            email: record.email,
            username: record.username,
            name: record.name,
            password: record.password,
            status: record.status
        })
        setShowAddEditForm(true)
    }

    const deleteRecord = (record) => {
        deleteUserMutate(record)
    }

    const items = (record) => {
        return [
            {
                key: '1',
                label: (
                    <a onClick={() => changeStatus(record)}>
                        {record.status === 'Active' ? 'Deactivate' : 'Activate'}
                    </a>
                ),
            },
            {
                key: '2',
                label: (
                    <a onClick={() => editRecord(record)}>
                        Edit
                    </a>
                )
            },
            {
                key: '3',
                label: (
                    <Popconfirm
                        title="Are you sure to delete this User?"
                        onConfirm={() => deleteRecord(record)}
                        onCancel={() => console.log('cancel')}
                        okText="Yes"
                        cancelText="No"
                    >
                        <a>
                            Delete
                        </a>
                    </Popconfirm>

                )
            }
        ]
    };

    const menu = (items) => (
        <Menu items={items} />
    );

    const columns = [
        {
            title: 'Alias',
            dataIndex: 'alias',
            key: 'alias',
            width: '20%',
            ...getColumnSearchProps('alias'),
            sorter: (a, b) => a.alias.length - b.alias.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            width: '20%',
            ...getColumnSearchProps('email'),
            sorter: (a, b) => a.email.length - b.email.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '20%',
            ...getColumnSearchProps('name'),
            sorter: (a, b) => a.name.length - b.name.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Username',
            dataIndex: 'username',
            key: 'username',
            width: '20%',
            ...getColumnSearchProps('username'),
            sorter: (a, b) => a.username.length - b.username.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Password',
            dataIndex: 'password',
            key: 'password',
            width: '20%',
            ...getColumnSearchProps('password'),
            sorter: (a, b) => a.password.length - b.password.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: '20%',
            ...getColumnSearchProps('status'),
            sorter: (a, b) => a.status.length - b.status.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Action',
            key: 'action',
            width: '20%',
            render: (_, record) => (
                <Dropdown overlay={menu(items(record))}>
                    <a onClick={e => e.preventDefault()}>
                        <Space>
                            Actions
                            <DownOutlined />
                        </Space>
                    </a>
                </Dropdown>
            )
        },
    ];


    const submitUsers = (values) => {
        console.log(values)
        if (values.key) {
            editUserMutate(values)
        } else {
            addUserMutate(values)
        }
    };

    const onReset = () => {
        form.resetFields();
    };

    const navigate = useNavigate()
    useEffect(() => {
        if (!props.token) {
            const isAdmin = localStorage.getItem('isAdmin')
            if (!isAdmin) {
                navigate("/login")
            }
        }
    }, [])

    const layout = {
        labelCol: { span: 5 },
        wrapperCol: { span: 16 },
    };

    const tailLayout = {
        wrapperCol: { offset: 6, span: 16 },
    };

    return (
        <div>
            {contextHolder}
            <div className="flex justify-between">
                <h1>Users</h1>
                <Button type="primary" onClick={() => setShowAddEditForm((prev) => { form.resetFields(); return !prev })}>
                    {`${showAddEditForm ? 'Back' : 'Add User'}`}
                </Button>
            </div>

            {
                showAddEditForm && (
                    <div className="flex justify-start mt-5 ">
                        <Form form={form} {...layout} name="control-hooks" className="w-full" onFinish={submitUsers}>
                            <Form.Item name="key" label="Key" hidden>
                                <Input />
                            </Form.Item>

                            <Row>
                                <Col span={12}>
                                    <Form.Item name="alias" label="Alias" labelAlign="left" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item name="email" label="Email" labelAlign="left" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Row>
                                <Col span={12}>
                                    <Form.Item name="name" label="Name" labelAlign="left" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>

                                <Col span={12}>
                                    <Form.Item name="username" label="Username" labelAlign="left" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>
                            

                            <Row>
                                <Col span={12}>
                                    <Form.Item name="isAdmin" label="Is Admin" labelAlign="left" rules={[{ required: true }]} initialValue="false">
                                        <Select placeholder="Set Admin" allowClear>
                                            <Option value="true">True</Option>
                                            <Option value="false">False</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="password" label="Password" labelAlign="left" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="status" label="Status" labelAlign="left" rules={[{ required: true }]} initialValue="Active">
                                        <Select
                                            placeholder="Set Status"
                                            allowClear
                                        >
                                            <Option value="Active">Active</Option>
                                            <Option value="Inactive">Inactive</Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div className="flex justify-end">
                                <Form.Item >
                                    <Button type="primary" htmlType="submit" className="mr-2">
                                        Submit
                                    </Button>
                                </Form.Item>
                                <Form.Item >
                                    {
                                        !form.getFieldValue('key') && (
                                            <Button htmlType="button" onClick={onReset}>
                                                Reset
                                            </Button>
                                        )
                                    }
                                </Form.Item>
                            </div>
                        </Form>
                    </div>
                )
            }

            {
                errors && (
                    <div className="flex justify-center mt-5">
                        {
                            errors.map((error) => (
                                <Alert message={error.message} type="error" showIcon />
                            ))
                        }
                    </div>
                )
            }

            {
                !showAddEditForm && (
                    <Table columns={columns} dataSource={usersData?.data} scroll={{ y: 600, x: '100vw' }} className="mt-5" />
                )
            }
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

export default connect(mapStateToProps, mapDispatchToProps)(UsersAdmin)