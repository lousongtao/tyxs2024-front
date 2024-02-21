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
const SubsidizeTable = (props) => {

  //给原有数值赋予key值, 否则没有key会导致操作失败.
  const assignKey = () => {
    props.subsidizeList?.forEach(p => p.key = p.seq);
    return props.subsidizeList;
  }

  //如果有带入的数据, 要找到最大的那个seq, 避免产生重复的记录
  const getMaxSeq = (list) => {
    let max = 0;
    list?.forEach(p => max = Math.max(max, p.seq));
    return max;
  }

  const [dataSource, setDataSource] = useState(assignKey());

  //count 用来给新增加的记录排序用的.
  const [count, setCount] = useState(getMaxSeq(props.subsidizeList) + 1);

  const handleDelete = (key) => {
    const newData = dataSource.filter((item) => item.key !== key);
    setDataSource(newData);
    props.onDeleteSubsidize(newData);
  };
  const defaultColumns = [
    {
      title: '序号',
      dataIndex: 'seq',
      editable: true,
    },
    {
      title: '获资助时间(YYYY-MM-DD)',
      dataIndex: 'date',
      editable: true,
    },
    {
      title: '计划编号',
      dataIndex: 'planNo',
      editable: true,
    },
    {
      title: '计划名称',
      dataIndex: 'planName',
      editable: true
    },
    {
      title: '计划类型',
      dataIndex: 'planType',
      editable: true
    },
    {
      title: '资助金额（万元）',
      dataIndex: 'amount',
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
      seq: count,
      date: '2000-01-01',
      planNo: '计划编号',
      planName: '计划名称',
      planType: '计划类型',
      amount: '0'
    };
    setDataSource([...dataSource, newData]);
    setCount(count + 1);
  };
  const handleSave = (row) => {
    //首先把日期格式调整为两位的月份和日期
    row.date = formatDate1(row.date);
    //check date format
    if (!checkDateFormat(row.date)){
      message.error("获资助时间格式不对: "+ row.date);
      return;
    }
    //检查是否序号存在冲突, 冲突的序号, 在下次载入时会导致行操作失败, key值产生不正确.
    dataSource?.forEach(r => {
      if (r.key != row.key && r.seq == row.seq){
        const max = getMaxSeq(dataSource) + 1;
        row.seq = max;
        message.error("序号(" + r.seq + ")冲突, 已自动调整为 " + max);
        return;
      }
    })
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
    props.onChangeSubsidize(newData);
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
        添加资助
      </Button>
    )
  }

  return (
    <Card title="资助情况" bordered={false} style={{ width: '100%' }}>
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
export default SubsidizeTable;
