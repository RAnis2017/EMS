import React, { useEffect, useRef, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
    DownOutlined
} from '@ant-design/icons';
import { Space, Table, Dropdown, Button, Form, Input, Select, Menu, Row, Col, Alert, notification, Popconfirm } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useMutation, useQuery, useQueryClient } from 'react-query'

import './SkillsetAdmin.css'

const { Option } = Select;

function SkillsetAdmin(props) {
    const [showAddEditForm, setShowAddEditForm] = useState(false)
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const queryClient = useQueryClient()
    const [errors, setErrors] = useState(null)
    const [api, contextHolder] = notification.useNotification();

    const openNotification = (type) => {
        let description = type === 'create' ? 'Skillset created successfully' : 'Skillset updated successfully'
        api.info({
          message: 'Action Successful',
          description,
          placement: 'topRight',
        });
      };

    const { isLoading: techsLoading, data: techData } = useQuery('technologies', () =>
        fetch('http://localhost:3001/admin/get-technologies', {
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

    const { isLoading: addSkillLoading, isSuccess: addSkillSuccess, mutate: addSkillMutate } = useMutation('add-skills', (data) =>
        fetch('http://localhost:3001/admin/add-skill', {
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
                queryClient.invalidateQueries('skills')
            }
        }
    }
    )

    const { isLoading: editSkillLoading, isSuccess: editSkillSuccess, mutate: editSkillMutate } = useMutation('edit-skills', (data) =>
        fetch('http://localhost:3001/admin/update-skill/' + data.key, {
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
                queryClient.invalidateQueries('skills')
            }
        }
    }
    )

    const { isLoading: deleteSkillLoading, isSuccess: deleteSkillSuccess, mutate: deleteSkillMutate } = useMutation('delete-skill', (data) =>
        fetch('http://localhost:3001/admin/delete-skill/' + data.key, {
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
            queryClient.invalidateQueries('skills')
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
        editSkillMutate(record)
    }

    const editRecord = (record) => {
        form.setFieldsValue({
            key: record.key,
            name: record.name,
            technology: record.technology,
            technologyId: record.technologyId,
            status: record.status
        })
        setShowAddEditForm(true)
    }

    const deleteRecord = (record) => {
        deleteSkillMutate(record)
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
                        title="Are you sure to delete this Skillset?"
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
            title: 'ID',
            dataIndex: 'key',
            key: 'key',
            width: '5%',
            ...getColumnSearchProps('key'),
            sorter: (a, b) => a.key.length - b.key.length,
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
            title: 'Technology',
            dataIndex: 'technology',
            key: 'technology',
            width: '20%',
            ...getColumnSearchProps('technology'),
            sorter: (a, b) => a.technology.length - b.technology.length,
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
            title: 'Created By',
            dataIndex: 'createdBy',
            key: 'createdBy',
            ...getColumnSearchProps('createdBy'),
            sorter: (a, b) => a.createdBy.length - b.createdBy.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Created Date',
            dataIndex: 'createdDate',
            key: 'createdDate',
            ...getColumnSearchProps('createdDate'),
            sorter: (a, b) => a.createdDate - b.createdDate,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Action',
            key: 'action',
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


    const submitSkills = (values) => {
        console.log(values)
        if (values.key) {
            editSkillMutate(values)
        } else {
            addSkillMutate(values)
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
        labelCol: { span: 7 },
        wrapperCol: { span: 14 },
    };

    return (
        <div>
            {contextHolder}
            <div className="flex justify-between">
                <h1>Skill Sets</h1>
                <Button type="primary" onClick={() => setShowAddEditForm((prev) =>{ form.resetFields(); return !prev})}>
                    {`${showAddEditForm ? 'Back' : 'Add Skillset'}`}
                </Button>
            </div>

            {
                showAddEditForm && (
                    <div className="flex justify-center mt-7">
                        <Form form={form} {...layout} name="control-hooks" className="w-full" onFinish={submitSkills}>
                            <Form.Item name="key" label="Key" hidden>
                                <Input />
                            </Form.Item>
                            <Form.Item name="technologyId" label="technologyId" hidden>
                                <Input />
                            </Form.Item>
                            <Row gutter={5}>
                                <Col span={8}>
                                    <Form.Item name="name" label="Name" labelAlign="left" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="technology" label="Technology" labelAlign="left" rules={[{ required: true }]}>
                                        <Select
                                            placeholder="Set Technology"
                                            allowClear
                                        >
                                            {
                                                techData.data.map((tech) => (
                                                    <Option key={tech.key} value={tech.key}>{tech.name}</Option>
                                                ))
                                            }
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item name="status" label="Status" labelAlign="left" rules={[{ required: true }]} initialValue="active">
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
                                </Form.Item>
                                <Form.Item>
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
                    <Table columns={columns} dataSource={skillData?.data} className="mt-5" />
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

export default connect(mapStateToProps, mapDispatchToProps)(SkillsetAdmin)