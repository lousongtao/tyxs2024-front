import {PageContainer} from "@ant-design/pro-layout";
import {Button, Select} from "antd";
import {PlusOutlined} from "@ant-design/icons";
import {getAccounts, getOrgTypes} from "@/services/ant-design-pro/api";
import ProTable from "@ant-design/pro-table";
import React, {useEffect, useRef, useState} from "react";
import {useModel} from "umi";
import AccountModal from "@/pages/account/component/AccountModal";
import PasswordModal from "@/pages/account/component/PasswordModal";
import SBDWAccountModal from "@/pages/account/component/SBDWAccountModal";
import TJDWAccountModal from "@/pages/account/component/TJDWAccountModal";


//2021-11-28T08:05:10.000+00:00 to 2021-11-28 08:05:10
export const getFullDate = dt => {
  const dateAndTime = dt.split('T');

  return dateAndTime[0] + " " + dateAndTime[1].split('.')[0];
};
/**
 * 创建帐号时, 管理员帐号由数据库直接输入; 管理员创建的帐号即是"推荐单位"; "推荐单位"创建的即是"申报单位";
 * type值不用考虑, 后台根据此逻辑创建对应类型的帐号
 * @returns {JSX.Element}
 * @constructor
 */
const TableList = () => {
  // const [selectedRowsState, setSelectedRows] = useState([]);
  const [modalTitle, setModalTitle] = useState();
  //要编辑的记录, 初始为空对象. 保存成功后初始化这个值为空; 点击修改时, 把表格中记录传递个弹出窗口
  const [editAccount, setEditAccount] = useState({});
  const [editPasswordAccount, setEditPasswordAccount] = useState({});
  const { initialState, setInitialState } = useModel('@@initialState');
  const actionRef = useRef();
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 100,
      hideInTable: true,
      hideInSearch: true
    },
    {
      title: '单位名称',
      dataIndex: 'name'
    },
    {
      title: '帐号',
      dataIndex: 'account'
    },
    {
      title: '注册日期',
      dataIndex: 'createDate',
      hideInSearch: true,
      render: date => getFullDate(date)
    },
    {
      title: '角色',
      dataIndex: 'type',
      valueEnum: {
        1: '管理员',
        2: '推荐单位',
        3: '申报单位',
      },
    },
    {
      title: '申报类型',
      dataIndex: 'permission',
      hideInSearch: true,
      valueEnum: {
        'brand': '科普品牌',
        'people': '科普人物',
        'mgmtorg': '科普管理(组织机构)',
        'mgmtindividual': '科普管理(个人)',
        'works': '科普作品'
      }
    },
    {
      title: '机构类型',
      dataIndex: 'orgTypeId',
      renderFormItem: () => {
        return (
          <Select style={{width:200}}>
            {orgTypes.map(rd => {
              return <Select.Option key={rd.id} value={rd.id}>{rd.name}</Select.Option>
            })}
          </Select>
        )
      },
      renderText: (text) => {
        for (let i = 0; i< orgTypes.length; i++){
          if (orgTypes[i].id === text)
            return orgTypes[i].name;
        }
        return '';
      }
    },
    {
      title: '电话',
      hideInSearch: true,
      dataIndex: 'phone'
    },
    {
      title: '操作',
      width: 180,
      key: 'option',
      valueType: 'option',
      render: (text, record) => {
        return [<a key="primary" onClick={() => handleUpdate(record)}>修改</a>,
          <a key="primary" onClick={() => handleUpdatePassword(record)}>修改密码</a>,]
      }
    },
  ];

  const [tjdwModalVisible, setTJDWModalVisible] = useState(false);
  const [sbdwModalVisible, setSBDWModalVisible] = useState(false);
  const [pwdModalVisible, setPWDModalVisible] = useState(false);
  //给查询结果增加key, 否则antdesign总是提醒错误.
  const getAccs = async (params) => {
    const as = await getAccounts(params);
    as.data.map(a => a.key = a.id);
    return as;
  }
  const handleAdd = () => {
    setModalTitle('创建帐号');
    setEditAccount({});//传递一个空对象
    if (initialState.currentUser?.type === 1)
      setTJDWModalVisible(true);
    if (initialState.currentUser?.type === 2)
      setSBDWModalVisible(true);
  }

  const handleUpdate = (record) => {
    setEditAccount(record);
    setModalTitle('编辑帐号');
    if (record.type === 2)
      setTJDWModalVisible(true);
    if (record.type === 3)
      setSBDWModalVisible(true);
  }

  const handleUpdatePassword = (record) => {
    setEditPasswordAccount(record);
    setPWDModalVisible(true);
  }

  const handleSaveFinish = () => {
    actionRef.current.reload();//刷新表格
    setTJDWModalVisible(false);
    setSBDWModalVisible(false);
  }

  const [orgTypes, setOrgTypes] = useState([]);
  //机构类型
  useEffect(() => {
    const fetchData = async () => {
      const orgTypes = await getOrgTypes();
      setOrgTypes(orgTypes);
    }
    fetchData();
  }, []);

  return (
    <PageContainer>
      <ProTable
        rowKey="key"
        search={{
          labelWidth: 120,
          collapsed:false
        }}
        actionRef={actionRef}
        toolBarRender={() => [
          <Button type="primary" key="primary" disabled={initialState.currentUser?.type === 3}
                  onClick={handleAdd}>
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={params => getAccs(params)}
        columns={columns}
      />
      <SBDWAccountModal
        onCancel={() => setSBDWModalVisible(false)}
        closeModal={() => setSBDWModalVisible(false)}
        onSaveFinish={handleSaveFinish}
        modalTitle={modalTitle}
        editAccount={editAccount}
        visible={sbdwModalVisible}/>
      <TJDWAccountModal
        onCancel={() => setTJDWModalVisible(false)}
        closeModal={() => setTJDWModalVisible(false)}
        onSaveFinish={handleSaveFinish}
        modalTitle={modalTitle}
        editAccount={editAccount}
        visible={tjdwModalVisible}/>
      <PasswordModal
        onCancel={() => setPWDModalVisible(false)}
        closeModal={() => setPWDModalVisible(false)}
        onSaveFinish={() => setPWDModalVisible(false)}
        editPasswordAccount={editPasswordAccount}
        visible={pwdModalVisible}/>
    </PageContainer>
  )
}

export default TableList;
