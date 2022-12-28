import React, { useEffect, useRef, useState } from "react"
import { connect } from "react-redux"
import { useNavigate } from "react-router-dom"
import {
    DownOutlined
} from '@ant-design/icons';
import { Space, Table, Dropdown, Button, Form, Input, Select, Menu, Row, Col, Alert, notification, Popconfirm, Rate, DatePicker, TimePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useMutation, useQuery, useQueryClient } from 'react-query'
import './CalendarAdmin.css'
import { Badge, Calendar } from 'antd';
import moment from "moment";
import { timeFormater } from "../utils";

const { Option } = Select;

function CalendarAdmin(props) {
    const [showAddEditForm, setShowAddEditForm] = useState(false)
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const queryClient = useQueryClient()
    const [errors, setErrors] = useState(null)
    const [api, contextHolder] = notification.useNotification();
    const [selectedManager, setSelectedManager] = useState(null)
    const [selectedSupManager, setSelectedSupManager] = useState(null)

    const openNotification = (type) => {
        let description = type === 'create' ? 'Calendar Event created successfully' : 'Calendar Event updated successfully'
        api.info({
            message: 'Action Successful',
            description,
            placement: 'topRight',
        });
    };

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
        onSuccess: () => {

        }
    }
    )

    const { isLoading: addCalendarLoading, isSuccess: addCalendarSuccess, mutate: addCalendarMutate } = useMutation('add-calendar', (data) =>
        fetch('http://localhost:3001/admin/add-calendar', {
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
                if (data.error == 'Calendar event already exists') {
                    setErrors([{
                        message: data.error
                    }])
                }
                if (data.error?.errors) {
                    let errors = data.error.errors
                    setErrors(errors)
                }
            } else {
                setErrors([])
                openNotification('create')
                setShowAddEditForm(false)
                form.resetFields()
                queryClient.invalidateQueries('calendars')
            }
        }
    }
    )

    const { isLoading: editCalendarLoading, isSuccess: editCalendarSuccess, mutate: editCalendarMutate } = useMutation('edit-calendar', (data) =>
        fetch('http://localhost:3001/admin/update-calendar/' + data.key, {
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
                if (data.error == 'Calendar event already exists') {
                    setErrors([{
                        message: data.error
                    }])
                }
                if (data.error?.errors) {
                    let errors = data.error.errors
                    setErrors(errors)
                }
            } else {
                setErrors([])
                openNotification('update')
                setShowAddEditForm(false)
                form.resetFields()
                queryClient.invalidateQueries('calendars')
            }
        }
    }
    )

    const { isLoading: deleteCalendarLoading, isSuccess: deleteCalendarSuccess, mutate: deleteCalendarMutate } = useMutation('delete-calendar', (data) =>
        fetch('http://localhost:3001/admin/delete-calendar/' + data.key, {
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
            queryClient.invalidateQueries('calendars')
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

    const editRecord = (record) => {
        console.log(record)

        // convert date format from DD/MM/YYYY to YYYY-MM-DD
        let date = moment(record.date.split('/').reverse().join('-')).zone('+05:00')

        let fields = {
            key: record.key,
            developer: record.developer,
            date,
            startTime: moment(record.startTime),
        }

        console.log(fields)
        form.setFieldsValue(fields)

        setShowAddEditForm(true)
    }

    const deleteRecord = (record) => {
        deleteCalendarMutate(record)
    }

    const items = (record) => {
        return [
            // {
            //     key: '2',
            //     label: (
            //         <a onClick={() => editRecord(record)}>
            //             Edit
            //         </a>
            //     )
            // },
            {
                key: '3',
                label: (
                    <Popconfirm
                        title="Are you sure to delete this Event?"
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
            title: 'Developer',
            dataIndex: 'developerName',
            key: 'developerName',
            width: '12%',
            ...getColumnSearchProps('developerName'),
            sorter: (a, b) => a.developerName.length - b.developerName.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Manager',
            dataIndex: 'manager',
            key: 'manager',
            width: '12%',
            ...getColumnSearchProps('manager'),
            sorter: (a, b) => a.manager.length - b.manager.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Supporting Manager',
            dataIndex: 'sportingManager',
            key: 'sportingManager',
            width: '12%',
            ...getColumnSearchProps('sportingManager'),
            sorter: (a, b) => a.sportingManager.length - b.sportingManager.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Meeting Date',
            dataIndex: 'date',
            key: 'date',
            width: '9%',
            ...getColumnSearchProps('date'),
            sorter: (a, b) => a.date.length - b.date.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Meeting Time',
            key: 'startTimeA',
            width: '15%',
            ...getColumnSearchProps('startTime'),
            // dataIndex: 'startTime',
            render: (_, record) => {
                let time = timeFormater(record.startTime)
                return time
            },
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


    const submitCalendars = (values) => {
        if (values.key) {
            values.date = values.date.format('YYYY-MM-DD')
            values.endDate = values.endDate.format('YYYY-MM-DD')
            editCalendarMutate(values)
        } else {
            values.date = values.date.format('YYYY-MM-DD')
            values.endDate = values.endDate.format('YYYY-MM-DD')
            addCalendarMutate(values)
        }
    };

    const onReset = () => {
        form.resetFields();
        setErrors([])
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
        labelCol: { span: 8 },
        wrapperCol: { span: 12 },
    };

    const getListData = (value) => {
        let listData = [];

        calendarData?.data?.forEach((item) => {
            if (item.date === value.format('DD/MM/YYYY')) {
                // startTime get time only
                let startTime = item.startTime;
                startTime = new Date(startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
                listData.push({
                    ...item,
                    startTimeFormatted: startTime
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

    const dateCellRender = (value) => {
        const listData = getListData(value);
        return (
            <ul className="events">
                {listData?.length > 0 && <span className="bg-red-400 p-1 rounded mb-1 text-white">{listData?.length} Meetings</span>}
                {listData.map((item) => (
                    <li key={item.key} className="hover:bg-gray-600 hover:text-white p-2 rounded-md" onClick={() => console.log(item)}>
                        {item.manager} & {item.sportingManager} Meeting with {item.developerName} @ {item.startTimeFormatted}

                        <Dropdown overlay={menu(items(item))}>
                            <a onClick={e => e.preventDefault()}>
                                <Space align="right" className="text-white bg-gray-600 p-1 rounded-lg">
                                    Actions
                                    <DownOutlined />
                                </Space>
                            </a>
                        </Dropdown>
                    </li>
                ))}
            </ul>
        );
    };

    return (
        <div>
            {contextHolder}
            <div className="flex justify-between">
                <h1>Schedular</h1>
                <Button type="primary" onClick={() => setShowAddEditForm((prev) => { form.resetFields(); return !prev })}>
                    {`${showAddEditForm ? 'Back' : 'Add Meeting'}`}
                </Button>
            </div>

            {
                showAddEditForm && (
                    <div className="flex justify-center mt-7">
                        <Form form={form} {...layout} name="control-hooks" className="w-full" onFinish={submitCalendars}>
                            <Form.Item name="key" label="Key" hidden>
                                <Input />
                            </Form.Item>
                            <Row gutter={2}>
                                <Col span={12}>
                                    <Form.Item name="developer" label="Developer" labelAlign="left" rules={[{ required: true }]}>
                                        <Select>
                                            {employeesData?.data?.map((developer) => (
                                                <Option key={developer.key} value={developer.key}>{developer.alias}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="date" label="Date" labelAlign="left" rules={[{ required: true }]}>
                                        <DatePicker disabledTime={true} />
                                    </Form.Item>
                                </Col>
                                
                            </Row>
                            <Row gutter={2}>
                                <Col span={12}>
                                    <Form.Item name="endDate" label="End Date" labelAlign="left" rules={[{ required: true }]}>
                                        <DatePicker disabledTime={true} />
                                    </Form.Item>
                                </Col>
                                <Col span={12}>
                                    <Form.Item name="startTime" label="Time" labelAlign="left" rules={[{ required: true }]}>
                                        <TimePicker use12Hours format="h:mm A" />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <div className="flex justify-center">
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
                    <Table columns={columns} dataSource={calendarData?.data} scroll={{ y: 600, x: '100vw' }} className="mt-5" />
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

export default connect(mapStateToProps, mapDispatchToProps)(CalendarAdmin)