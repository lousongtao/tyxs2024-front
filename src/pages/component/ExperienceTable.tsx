import {Button, Card, Form, Input, message, Popconfirm, Table} from 'antd';
import React, { useContext, useEffect, useRef, useState } from 'react';
import {checkDateFormat, formatDate1} from "@/pages/utils";
const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
                        title,
                        editable,
                        children,
                        dataIndex,
                        record,
                        handleSave,
                        ...restProps
                      }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);
  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };
  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };
  let childNode = children;
  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `请输入 ${title}.`,
          },
        ]}
      >
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
const ExperienceTable = (props) => {
  //给原有数值赋予key值, 否则没有key会导致操作失败.
  const assignKey = () => {
    let seq = 1;
    props.experienceList?.forEach(p => p.key = seq++);
    return props.experienceList;
  }

  const [dataSource, setDataSource] = useState(assignKey());

  //count 用来给新增加的记录排序用的.
  const [count, setCount] = useState(props.experienceList? props.experienceList.length + 1 : 1);

  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
    props.onDeleteExpr(newData);
  };
  const defaultColumns = [
    {
      title: '开始时间(YYYY-MM-DD)',
      dataIndex: 'startDate',
      editable: true,
    },
    {
      title: '结束时间(YYYY-MM-DD)',
      dataIndex: 'endDate',
      editable: true,
    },
    {
      title: '单位',
      dataIndex: 'company',
      editable: true,
    },
    {
      title: '职务',
      dataIndex: 'title',
      editable: true
    },
    {
      title: '操作',
      dataIndex: 'operation',
      render: (text, record) => getOperationMenu(record)
    },
  ];

  const getOperationMenu = (record) => {
    if (props.disabled) return null;
    if (dataSource.length < 1) return null;
    return (
      <Popconfirm title="确认删除该记录?" onConfirm={() => handleDelete(record.key)}>
        <a>删除</a>
      </Popconfirm>
    )
  }

  const handleAdd = () => {
    const newData = {
      key: count,
      startDate: `2000-01-01`,
      endDate: '2001-01-01',
      company: `您的单位`,
      title: '您的职务'
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };
  const handleSave = (row) => {
    //首先把日期格式调整为两位的月份和日期
    row.startDate = formatDate1(row.startDate);
    row.endDate = formatDate1(row.endDate);
    //check date format
    if (!checkDateFormat(row.startDate)){
      message.error("开始时间格式不对: "+ row.startDate);
      return;
    }
    if (!checkDateFormat(row.endDate)){
      message.error("结束时间格式不对: "+ row.endDate);
      return;
    }

    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });

    setDataSource(newData);
    props.onChangeExpr(newData);
  };
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };
  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    if (props.disabled)
      return col;
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
      }),
    };
  });

  const getButton = () => {
    if (props.disabled) return null;
    return (
      <Button
        onClick={handleAdd}
        type="primary"
        style={{
          marginBottom: 16,
        }}
      >
        添加工作经历
      </Button>
    )
  }

  return (
    <Card title="工作经历" bordered={false} style={{ width: '100%' }}>
      <Table
        components={components}
        rowClassName={() => 'editable-row'}
        bordered
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
      {getButton()}
    </Card>
  );
};
export default ExperienceTable;
