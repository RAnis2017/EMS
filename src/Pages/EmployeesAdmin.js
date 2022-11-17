import React, { useEffect, useRef, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
    DownOutlined
} from '@ant-design/icons';
import { Space, Table, Dropdown, Button, Form, Input, Select, Menu, Tag, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useMutation, useQuery, useQueryClient } from 'react-query'

import './EmployeesAdmin.css'

const { Option } = Select;

function EmployeesAdmin(props) {
    const [showAddEditForm, setShowAddEditForm] = useState(false)
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const queryClient = useQueryClient()
    const [skills, setSkills] = useState([])

    const { isLoading: techsLoading, data: techData } = useQuery('technologies-skills', () =>
        fetch('http://localhost:3001/admin/get-technologies-skills', {
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

    const { isLoading: skillsLoading, data: skillData } = useQuery('skills', () =>
        fetch('http://localhost:3001/admin/get-skills', {
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
        )
    )

    const { isLoading: addEmployeeLoading, isSuccess: addEmployeeSuccess, mutate: addEmployeeMutate } = useMutation('add-employees', (data) =>
        fetch('http://localhost:3001/admin/add-employee', {
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
            setShowAddEditForm(false)
            form.resetFields()
            queryClient.invalidateQueries('employees')
        }
    }
    )

    const { isLoading: editEmployeeLoading, isSuccess: editEmployeeSuccess, mutate: editEmployeeMutate } = useMutation('edit-employees', (data) =>
        fetch('http://localhost:3001/admin/update-employee/' + data.key, {
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
            setShowAddEditForm(false)
            form.resetFields()
            queryClient.invalidateQueries('employees')
        }
    }
    )

    const { isLoading: deleteEmployeeLoading, isSuccess: deleteEmployeeSuccess, mutate: deleteEmployeeMutate } = useMutation('delete-employee', (data) =>
        fetch('http://localhost:3001/admin/delete-employee/' + data.key, {
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
            queryClient.invalidateQueries('employees')
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
        editEmployeeMutate(record)
    }

    const editRecord = (record) => {

        let skills = []
        if (record.skills) {
            skills = record.skills?.length && record.skills.indexOf(',') > -1 ? record.skills.split(',') : [`${record.skills}`]
            skills = skillData.data.filter((skill) => {
                console.log(skills)
                if (skills.indexOf(`${skill.key}`) > -1) {
                    return true
                }
                return false
            })
        }

        techData.data.find((item) => {
            if (parseInt(item.key) === parseInt(record.technologyId)) {
                setSkills(item.skills)
            }
        }
        )

        form.setFieldsValue({
            key: record.key,
            alias: record.alias,
            email: record.email,
            technology: record.technologyId,
            skills: skills,
            status: record.status,
            manager: record.manager,
            sporting_manager: record.sporting_manager
        })
        setShowAddEditForm(true)
    }

    const deleteRecord = (record) => {
        deleteEmployeeMutate(record)
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
                    <a onClick={() => deleteRecord(record)}>
                        Delete
                    </a>
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
            title: 'Technology',
            dataIndex: 'technology',
            key: 'technology',
            width: '20%',
            ...getColumnSearchProps('technology'),
            sorter: (a, b) => a.technology.length - b.technology.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Skillsets',
            dataIndex: 'skills',
            key: 'skills',
            width: '20%',
            ...getColumnSearchProps('skills'),
            sorter: (a, b) => a.skills.length - b.skills.length,
            sortDirections: ['descend', 'ascend'],
            render: (_, { skills }) => {
                let tags = []
                tags = skills?.length && skills.indexOf(',') > -1 ? skills.split(',') : [`${skills}`]
                tags = skillData.data.filter((skill) => {
                    if (tags.includes(`${skill.key}`)) {
                        return true
                    }
                    return false
                })
                return (
                    <>
                        {tags.map(skill => {
                            let color = 'geekblue';
                            return (
                                <Tag color={color} key={skill.key}>
                                    {skill.name.toUpperCase()}
                                </Tag>
                            );
                        })}
                    </>
                )
            },
        },
        {
            title: 'Manager',
            dataIndex: 'manager',
            key: 'manager',
            width: '20%',
            ...getColumnSearchProps('manager'),
            sorter: (a, b) => a.manager.length - b.manager.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Sporting Manager',
            dataIndex: 'sporting_manager',
            key: 'sporting_manager',
            width: '20%',
            ...getColumnSearchProps('sporting_manager'),
            sorter: (a, b) => a.sporting_manager.length - b.sporting_manager.length,
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


    const submitEmployees = (values) => {
        console.log(values)
        if (values.key) {
            editEmployeeMutate(values)
        } else {
            addEmployeeMutate(values)
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

    const handleTechnologyChange = (value) => {
        techData.data.find((item) => {
            if (parseInt(item.key) === parseInt(value)) {
                setSkills(item.skills)
            }
        }
        )
    }

    const layout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
    };

    const tailLayout = {
        wrapperCol: { offset: 6, span: 16 },
    };

    return (
        <div>
            <div className="flex justify-between">
                <h1>Employees</h1>
                <Button type="primary" onClick={() => setShowAddEditForm((prev) => !prev)}>
                    {`${showAddEditForm ? 'Close' : 'Add Employee'}`}
                </Button>
            </div>

            {
                showAddEditForm && (
                    <div className="flex justify-center flex-col mt-5 mr-5">
                        <Form form={form} {...layout} name="control-hooks" className="w-full" onFinish={submitEmployees}>
                            <Form.Item name="key" label="Key" hidden>
                                <Input />
                            </Form.Item>
                            <Form.Item name="technologyId" label="technologyId" hidden>
                                <Input />
                            </Form.Item>
                            
                            <Row>
                                <Col span={12}>
                            <Form.Item name="alias" label="Alias" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            </Col>

                            <Col span={12}>
                            <Form.Item name="email" label="Email">
                                <Input />
                            </Form.Item>
                            </Col>
                            </Row>
                          
                            <Row>
                                <Col span={12}>
                            <Form.Item name="technology" label="Technology" rules={[{ required: true }]}>
                                <Select
                                    placeholder="Set Technology"
                                    allowClear
                                    onChange={(e) => handleTechnologyChange(e)}
                                >
                                    {
                                        techData.data.map((tech) => (
                                            <Option key={tech.key} value={tech.key}>{tech.name}</Option>
                                        ))
                                    }
                                </Select>
                            </Form.Item>
                            </Col>

                            <Col span={12}>
                                
                            <Form.Item name="skills" label="Skillsets">
                                <Select
                                    mode="multiple"
                                    placeholder="Set Skillsets"
                                    allowClear
                                >
                                    {
                                        skills.map((skill) => (
                                            <Option key={skill.id} value={skill.id}>{skill.name}</Option>
                                        ))
                                    }
                                </Select>
                            </Form.Item>
                            </Col>
                            </Row>
                            <Row>
                                <Col span={12}>
                            <Form.Item name="manager" label="Manager" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            </Col>

                            <Col span={12}>
                            <Form.Item name="sporting_manager" label="Sporting Manager" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            </Col>
                            </Row>
                         
                            <Row>
                                <Col span={12}>
                            <Form.Item name="status" label="Status" rules={[{ required: true }]} initialValue="active">
                                <Select
                                    placeholder="Set Status"
                                    allowClear
                                >
                                    <Option value="active">Active</Option>
                                    <Option value="inactive">Inactive</Option>
                                </Select>
                            </Form.Item>
                            </Col>
                            </Row>
                        </Form>

                        <div className="flex justify-end">
                                <Button type="primary" htmlType="submit" className="mr-2">
                                    Submit
                                </Button>
                                <Button htmlType="button" onClick={onReset}>
                                    Reset
                                </Button>
                        </div>
                    </div>
                )
            }

            {
                !showAddEditForm && (
                    <Table columns={columns} dataSource={employeesData?.data} scroll={{ y: 600, x: '100vw' }} className="mt-5" />
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

export default connect(mapStateToProps, mapDispatchToProps)(EmployeesAdmin)