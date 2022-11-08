import React, { useEffect, useRef, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
    ArrowDownOutlined,
    ArrowUpOutlined,
    UserOutlined,
    AlertOutlined,
    NotificationOutlined,
    LaptopOutlined,
    ExclamationCircleOutlined,
    DownOutlined
} from '@ant-design/icons';
import { Space, Table, Dropdown, Button, Form, Input, Select, Menu } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';

import './TechnologiesAdmin.css'

const { Option } = Select;

function TechnologiesAdmin(props) {
    const [showAddEditForm, setShowAddEditForm] = useState(false)
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);

    const data = [
        {
            key: '1',
            name: 'Full Stack Developer',
            status: 'Active',
            createdBy: 'John Doe',
            createdDate: '2021-01-02',
        },
        {
            key: '2',
            name: 'Front End Developer',
            status: 'Active',
            createdBy: 'John Doe',
            createdDate: '2021-01-03',
        },
        {
            key: '3',
            name: 'Back End Developer',
            status: 'Active',
            createdBy: 'John Doe',
            createdDate: '2021-01-10',
        },
        {
            key: '4',
            name: 'DevOps Engineer',
            status: 'Active',
            createdBy: 'John Doe',
            createdDate: '2021-01-22',
        },
    ];

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
        console.log(record)
    }

    const editRecord = (record) => {
        console.log(record)
    }

    const deleteRecord = (record) => {
        console.log(record)
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
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            width: '30%',
            ...getColumnSearchProps('name'),
            sorter: (a, b) => a.name.length - b.name.length,
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
            render: (_, record) =>(
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


    const onFinish = (values) => {
        console.log(values);
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

    return (
        <div>
            <div className="flex justify-between">
                <h1>Technologies</h1>
                <Button type="primary" onClick={() => setShowAddEditForm((prev) => !prev)}>
                    {`${showAddEditForm ? 'Close' : 'Add Technology'}`}
                </Button>
            </div>

            {
                showAddEditForm && (
                    <div className="flex justify-center">
                        <Form form={form} name="control-hooks" className="w-1/2" onFinish={onFinish}>
                            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
                                <Input />
                            </Form.Item>
                            <Form.Item name="status" label="Status" rules={[{ required: true }]}>
                                <Select
                                    placeholder="Set Status"
                                    allowClear
                                >
                                    <Option value="active">Active</Option>
                                    <Option value="inactive">Inactive</Option>
                                </Select>
                            </Form.Item>

                            <div className="flex justify-end">
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" className="mr-2">
                                        Submit
                                    </Button>
                                    <Button htmlType="button" onClick={onReset}>
                                        Reset
                                    </Button>
                                </Form.Item>
                            </div>
                        </Form>
                    </div>
                )
            }

            {
                !showAddEditForm && (
                    <Table columns={columns} dataSource={data} className="mt-5" />
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

export default connect(mapStateToProps, mapDispatchToProps)(TechnologiesAdmin)