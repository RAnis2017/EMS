import React, { useEffect, useRef, useState } from "react"
import { connect } from "react-redux"
import { useNavigate, useParams } from "react-router-dom"
import {
    DownOutlined
} from '@ant-design/icons';
import { Space, Table, Dropdown, Button, Form, Input, Select, Menu, Row, Col, Alert, notification, Popconfirm, Rate, DatePicker } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import Highlighter from 'react-highlight-words';
import { useMutation, useQuery, useQueryClient } from 'react-query'

import './ReviewsAdmin.css'
import TextArea from "antd/lib/input/TextArea";
import moment from "moment";

const { Option } = Select;

function ReviewsAdmin(props) {
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
    const params = useParams()

    const openNotification = (type) => {
        let description = type === 'create' ? 'Review created successfully' : 'Review updated successfully'
        api.info({
          message: 'Action Successful',
          description,
          placement: 'topRight',
        });
      };

    const { isLoading: reviewsLoading, data: reviewData } = useQuery('reviews', () =>
        fetch('http://localhost:3001/admin/get-reviews', {
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

    const { isLoading: addReviewLoading, isSuccess: addReviewSuccess, mutate: addReviewMutate } = useMutation('add-review', (data) =>
        fetch('http://localhost:3001/admin/add-review', {
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
                navigate('/admin/reviews')
                queryClient.invalidateQueries('reviews')
            }
        }
    }
    )

    const { isLoading: editReviewLoading, isSuccess: editReviewSuccess, mutate: editReviewMutate } = useMutation('edit-review', (data) =>
        fetch('http://localhost:3001/admin/update-review/' + data.key, {
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
                navigate('/admin/reviews')
                queryClient.invalidateQueries('reviews')
            }
        }
    }
    )

    const { isLoading: deleteReviewLoading, isSuccess: deleteReviewSuccess, mutate: deleteReviewMutate } = useMutation('delete-review', (data) =>
        fetch('http://localhost:3001/admin/delete-review/' + data.key, {
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
            queryClient.invalidateQueries('reviews')
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
        let developer = employeesData?.data?.find((employee) => employee.alias === record.developer)
        let date = moment(record.createdDate.split('/').reverse().join('-'))

        form.setFieldsValue({
            key: record.key,
            developer: developer.key,
            text: record.text,
            createdDate: date,
            rating: record.rating
        })

        setSelectedManager(record.manager)
        setSelectedSupManager(record.sporting_manager)
        setShowAddEditForm(true)
    }

    const deleteRecord = (record) => {
        deleteReviewMutate(record)
    }

    const items = (record) => {
        return [
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
                        title="Are you sure to delete this Review?"
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
            dataIndex: 'developer',
            key: 'developer',
            width: '20%',
            ...getColumnSearchProps('developer'),
            sorter: (a, b) => a.developer.length - b.developer.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Manager',
            dataIndex: 'manager',
            key: 'manager',
            width: '20%',
            ...getColumnSearchProps('status'),
            sorter: (a, b) => a.manager.length - b.manager.length,
            sortDirections: ['descend', 'ascend'],
        },
        {
            title: 'Supporting Manager',
            dataIndex: 'sporting_manager',
            key: 'sporting_manager',
            width: '20%',
            ...getColumnSearchProps('status'),
            sorter: (a, b) => a.sporting_manager.length - b.sporting_manager.length,
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
            title: 'Review Date',
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


    const submitReviews = (values) => {
        console.log(values)
        if (values.key) {
            editReviewMutate(values)
        } else {
            addReviewMutate(values)
        }
    };

const disabledDate = (current) => {
    // Can not select days before today
    return current > moment().endOf('day');
  };

    const onReset = () => {
        form.resetFields();
        form.setFieldsValue({
            createdDate: moment()
        })
        setSelectedManager('')
        setSelectedSupManager('')
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

    useEffect(() => {

        if(params) {

            if(params.developer) {
                setShowAddEditForm(true)
                let developer = employeesData?.data?.find((dev) => dev.alias === params.developer)

                if(developer) {
                    form.setFieldsValue({
                        developer: developer.key
                    })
    
                    setSelectedManager(developer.manager_name)
                    setSelectedSupManager(developer.sporting_manager_name)
                }

            }

            if(params.date) {
                form.setFieldsValue({
                    createdDate: moment(params.date.split('-').reverse().join('-'))
                })
            }
        }

    }, [employeesData, params])

    const layout = {
        labelCol: { span: 7 },
        wrapperCol: { span: 14 },
    };

    return (
        <div>
            {contextHolder}
            <div className="flex justify-between">
                <h1>Reviews</h1>
                <Button type="primary" onClick={() => setShowAddEditForm((prev) => {onReset(); return !prev})}>
                    {`${showAddEditForm ? 'Back' : 'Add Review'}`}
                </Button>
            </div>

            {
                showAddEditForm && (
                    <div className="flex justify-center mt-7">
                        <Form form={form} {...layout}  name="control-hooks" className="w-full" onFinish={submitReviews}>
                            <Form.Item name="key" label="Key" hidden>
                                <Input />
                            </Form.Item>
                            <Row gutter={4}>
                                <Col span={8}>
                                    <Form.Item name="developer" label="Developer" labelAlign="left" rules={[{ required: true }]}>
                                        <Select
                                        onChange={(value) => {
                                            let developer = employeesData?.data?.find((dev) => dev.key === value)
                                            setSelectedManager(developer.manager_name)
                                            setSelectedSupManager(developer.sporting_manager_name)
                                        }}
                                        >
                                            {employeesData?.data?.map((developer) => (
                                                <Option key={developer.key} value={developer.key}>{developer.alias}</Option>
                                            ))}
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Manager" labelAlign="left" rules={[{ required: true }]}>
                                        <Input value={selectedManager} disabled="true"/>
                                    </Form.Item>
                                </Col>
                                <Col span={8}>
                                    <Form.Item label="Sup. Manager" labelAlign="left" rules={[{ required: true }]}>
                                        <Input value={selectedSupManager} disabled="true"/>
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={4}>
                                <Col span={8}>
                                    <Form.Item name="createdDate" label="Review Date" labelAlign="left" rules={[{ required: true }]}>
                                        <DatePicker defaultValue={moment()} disabledDate={disabledDate} />
                                    </Form.Item>
                                </Col>

                                <Col span={8}>
                                    <Form.Item name="rating" label="Ratings"  labelAlign="left" rules={[{ required: true }]}>
                                        <Rate allowHalf defaultValue={2.5} />
                                    </Form.Item>
                                </Col>
                            </Row>
                            <Row gutter={4}>
                                <Col span={22}>
                                    <Form.Item name="text" labelCol={2} wrapperCol={16}  label="Review" labelAlign="left" rules={[{ required: true }]}>
                                        <TextArea className="!ml-11" />
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
                    <Table columns={columns} dataSource={reviewData?.data} className="mt-5" />
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

export default connect(mapStateToProps, mapDispatchToProps)(ReviewsAdmin)