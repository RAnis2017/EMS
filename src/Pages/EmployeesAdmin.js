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
    const [errors, setErrors] = useState([])
    const [api, contextHolder] = notification.useNotification();
    const [managers, setManagers] = useState([])
    const [supportingManagers, setSupportingManagers] = useState([])
    const [filters, setFilters] = useState([])

    const openNotification = (type) => {
        let description = type === 'create' ? 'Developer created successfully' : 'Developer updated successfully'
        api.info({
          message: 'Action Successful',
          description,
          placement: 'topRight',
        });
      };

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
        ), {
        onSuccess: (data) => {
            // get all managers and supporting managers
            let managers = []
            let supportingManagers = []
            data?.data?.forEach(employee => {
                if(!managers.includes(employee.manager)) {
                    managers.push(employee.manager)
                }
                if(!supportingManagers.includes(employee.sporting_manager)) {
                    supportingManagers.push(employee.sporting_manager)
                }
            })

            setManagers(managers)
            setSupportingManagers(supportingManagers)

            // use filters to filter data
            filters.manager && (data.data = data.data.filter(employee => filters.manager.includes(employee.manager)))
            filters.sporting_manager && (data.data = data.data.filter(employee => filters.sporting_manager.includes(employee.sporting_manager)))
            
            if(filters.skills) {
                data.data = data.data.filter(employee => {
                    let employeeSkills = employee.skills.toString().split(',').map(skill => parseInt(skill.trim()))
                    let result = employeeSkills.filter(skill => filters.skills.includes(skill))
                    return result.length > 0
                })
            }

            if(filters.technology) {
                data.data = data.data.filter(employee => {
                    let employeeTechnologies = employee.technology.toString().split(',').map(technology => parseInt(technology.trim()))
                    let result = employeeTechnologies.filter(technology => filters.technology.includes(technology))
                    return result.length > 0
                })
            }
            
        }
    })

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
            if(data.error) {
                if(data.error?.errors) {
                    let errors = data.error.errors
                    setErrors(errors)
                }
            } else {
                setErrors([])
                openNotification('create')
                setShowAddEditForm(false)
                form.resetFields()
                queryClient.invalidateQueries('employees')
            }     
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
            if(data.error) {
                if(data.error?.errors) {
                    let errors = data.error.errors
                    setErrors(errors)
                }
            } else {
                setErrors([])
                openNotification('update')
                setShowAddEditForm(false)
                form.resetFields()
                queryClient.invalidateQueries('employees')
            }  
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

        let technologies = []
        if (record.technology) {
            technologies = record.technology?.length && record.technology.indexOf(',') > -1 ? record.technology.split(',') : [`${record.technology}`]
            technologies = techData.data.filter((technology) => {
                if (technologies.indexOf(`${technology.key}`) > -1) {
                    return true
                }
                return false
            })
        }

        let values = record.technology?.length && record.technology.indexOf(',') > -1 ? record.technology.split(',') : [`${record.technology}`]
        values = values.map((item) => parseInt(item)) 
        let selectedSkills = []
        techData.data.find((item) => {
            if (values.includes(parseInt(item.key))) {
                selectedSkills.push(...item.skills)
            }
        })
        setSkills(selectedSkills)

        form.setFieldsValue({
            key: record.key,
            alias: record.alias,
            email: record.email,
            technology: technologies,
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
                    <Popconfirm
                        title="Are you sure to delete this Developer?"
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
            title: 'Technologies',
            dataIndex: 'technology',
            key: 'technology',
            width: '20%',
            ...getColumnSearchProps('technology'),
            sorter: (a, b) => a.technology.length - b.technology.length,
            sortDirections: ['descend', 'ascend'],
            render: (_, { technology }) => {
                let tags = []
                tags = technology?.length && technology.indexOf(',') > -1 ? technology.split(',') : [`${technology}`]
                
                tags = techData?.data?.filter((tech) => {
                    if (tags.includes(`${tech.key}`)) {
                        return true
                    }
                    return false
                })
                return (
                    <>
                        {tags?.map(tech => {
                            let color = 'orange';
                            return (
                                <Tag color={color} key={tech.key}>
                                    {tech.name.toUpperCase()}
                                </Tag>
                            );
                        })}
                    </>
                )
            },
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
            title: 'Supporting Manager',
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
            if(values.technology.length || values.skills.length) {
                if(isNaN(values.technology[0])) {
                    values.technology = values.technology.map((tech) => {
                        return tech.key
                    })
                }
                if(isNaN(values.skills[0])) {
                    values.skills = values.skills.map((skill) => {
                        return skill.key
                    })
                }
            }
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
        let values = value.map((item) => parseInt(item)) 
        let skills = []
        techData.data.find((item) => {
            if (values.includes(parseInt(item.key))) {
                skills.push(...item.skills)
            }
        })
        setSkills(skills)
    }

    const handleFilterSelect = (value, type) => {
        let filter = {}
        if(type === 'manager') {
            filter['manager'] = value
        } else if(type === 'sporting_manager') {
            filter['sporting_manager'] = value
        } else if(type === 'technology') {
            filter['technology'] = value
        } else if(type === 'skills') {
            filter['skills'] = value
        }

        filter.manager?.length < 1 && delete filter.manager
        filter.sporting_manager?.length < 1 && delete filter.sporting_manager
        filter.technology?.length < 1 && delete filter.technology
        filter.skills?.length < 1 && delete filter.skills
        setFilters(filter)

        queryClient.invalidateQueries('employees')
    }

    const layout = {
        labelCol: { span: 8 },
    };

    const tailLayout = {
        wrapperCol: { offset: 6, span: 16 },
    };

    return (
        <div>
            {contextHolder}
            <div className="flex justify-between">
                <h1>Developers</h1>
                <Button type="primary" onClick={() => setShowAddEditForm((prev) => !prev)}>
                    {`${showAddEditForm ? 'Back' : 'Add Developer'}`}
                </Button>
            </div>

            <div>
                <h3>Filters</h3>
                <div className="flex justify-start flex-row">
                    <Select
                        mode="multiple"
                        className="w-1/4"
                        placeholder="Filter by Manager"
                        onChange={(e) => handleFilterSelect(e, 'manager')}
                        allowClear
                    >
                        {
                            managers?.map((manager, key) => (
                                <Option key={key} value={manager}>{manager}</Option>
                            ))
                        }
                    </Select>

                     <Select
                        mode="multiple"
                        className="w-1/4 !ml-5"
                        placeholder="Filter by Supporting Manager"
                        onChange={(e) => handleFilterSelect(e, 'sporting_manager')}
                        allowClear
                    >
                        {
                            supportingManagers?.map((manager, key) => (
                                <Option key={key} value={manager}>{manager}</Option>
                            ))
                        }
                    </Select>

                    <Select
                        mode="multiple"
                        className="w-1/4 !ml-5"
                        placeholder="Filter by Technology"
                        onChange={(e) => handleFilterSelect(e, 'technology')}
                        allowClear
                    >
                        {
                            techData?.data?.map((tech) => (
                                <Option key={tech.key} value={tech.key}>{tech.name}</Option>
                            ))
                        }
                    </Select>

                    <Select
                        mode="multiple"
                        className="w-1/4 !ml-5"
                        placeholder="Filter by Skills"
                        onChange={(e) => handleFilterSelect(e, 'skills')}
                        allowClear
                    >
                        {
                            skillData?.data?.map((skill) => (
                                <Option key={skill.key} value={skill.key}>{skill.name}</Option>
                            ))
                        }
                    </Select>
                </div>
            </div>

            {
                showAddEditForm && (
                    <div className="flex justify-start mt-5 -ml-28">
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
                                    mode="multiple"
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
                            <Form.Item name="sporting_manager" label="Supporting Manager" rules={[{ required: true }]}>
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

                            <div className="flex justify-end">
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" className="mr-2">
                                        Submit
                                    </Button>
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