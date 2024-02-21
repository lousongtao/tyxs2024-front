import React, { useRef, useState} from "react";
import {PageContainer} from "@ant-design/pro-layout";
import {Button, message, notification, Select, Upload} from "antd";
import ProTable from "@ant-design/pro-table";
import {DownloadOutlined, PlusOutlined} from "@ant-design/icons";
import {
  exportMgmtApi,
  exportPeopleApi,
  exportWorksApi,
  getPopsciMgmt,
  printReccApi
} from "@/services/ant-design-pro/api";
import {useModel, useAccess} from "umi";
import PopsciMgmtORGModal from "@/pages/PopsciMgmt/component/PopsciMgmtORGModal";
import PopsciMgmtIndividualModal from "@/pages/PopsciMgmt/component/PopsciMgmtIndividualModal";
import UploadReccFormModal from "@/pages/component/UploadReccFormModal";

/**
 * 健康科普管理, 分两类
 * 一类由组织机构申报
 * 一类由个人申报
 * 两类的字段不一样
 * 这里通过两个按钮分别弹出不同的窗口
 * 关于窗口title以及显示开关都同时定义两个
 * @returns {JSX.Element}
 * @constructor
 */
const TableList = () => {
  const actionRef = useRef();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [orgModalTitle, setORGModalTitle] = useState('添加优秀健康科普管理');
  const [individualModalTitle, setIndividualModalTitle] = useState('添加优秀健康科普管理');
  const [editObj, setEditObj] = useState({});
  const [orgModalVisible, setORGModalVisible] = useState(false);
  const [individualModalVisible, setIndividualModalVisible] = useState(false);
  const [orgViewMode, setORGViewMode] = useState(false); //以查看模式打开窗口
  const [individualViewMode, setIndividualViewMode] = useState(false); //以查看模式打开窗口
  const [uploadReccFormVisible, setUploadReccFormVisible] = useState(false);
  const refUploadReccForm = useRef();
  const access = useAccess();
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 100,
      hideInTable: true,
      hideInSearch: true
    },
    {
      title: '类型',
      dataIndex: 'applyType',
      width: 200,
      renderText: (text) => {
        switch (text){
          case 1: return "组织机构";
          case 2: return "个人";
        }
      },
      renderFormItem: () => {
        return (
          <Select style={{width:300}}>
              <Select.Option value="1" key={1}>组织机构</Select.Option>
              <Select.Option value="2" key={2}>个人</Select.Option>
          </Select>
        )
      }
    },
    {
      title: '单位名称',
      dataIndex: 'deptName',
      width: 200,
    },
    {
      title: '通讯地址',
      dataIndex: 'deptAddress',
      width: 200,
      hideInSearch: true
    },
    {
      title: '联系人',
      dataIndex: 'deptContact',
      width: 200,
      hideInSearch: true
    },
    {
      title: '联系部门',
      dataIndex: 'deptContactDept',
      width: 200,
      hideInSearch: true
    },
    {
      title: '手机号码',
      dataIndex: 'deptMobile',
      width: 200,
      hideInSearch: true
    },
    {
      title: '电子邮箱',
      dataIndex: 'deptEmail',
      width: 200,
      hideInSearch: true
    },
    {
      title: '姓名',
      dataIndex: 'name',
      width: 200,
    },
    {
      title: '性别',
      dataIndex: 'gender',
      width: 200,
      hideInSearch: true,
      renderText: (text) => {
        switch (text) {
          case 1: return '男';
          case 2: return '女';
          default: return '';
        }
      },
    },
    {
      title: '民族',
      dataIndex: 'race',
      width: 200,
      hideInSearch: true
    },
    {
      title: '学历',
      dataIndex: 'eduDegree',
      width: 200,
      hideInSearch: true,
      renderText: (text) => {
        switch (text) {
          case 1: return '小学';
          case 2: return '初中';
          case 3: return '高中';
          case 4: return '大专';
          case 5: return '大学本科';
          case 6: return '研究生';
          case 7: return '博士';
          default: return '';
        }
      },
    },
    {
      title: '手机号码',
      dataIndex: 'mobile',
      width: 200,
      hideInSearch: true
    },
    {
      title: '工作单位',
      dataIndex: 'company',
      width: 200,
      hideInSearch: true
    },
    {
      title: '职务',
      dataIndex: 'position',
      width: 200,
      hideInSearch: true
    },
    {
      title: '职称',
      dataIndex: 'title',
      width: 200,
      hideInSearch: true
    },
    {
      title: '通讯地址',
      dataIndex: 'address',
      width: 200,
      hideInSearch: true
    },
    {
      title: '电子邮箱',
      dataIndex: 'email',
      width: 200,
      hideInSearch: true
    },
    {
      title: '从事专业/工作领域',
      dataIndex: 'domain',
      width: 200,
      hideInSearch: true
    },
    {
      title: '操作',
      width: 180,
      key: 'option',
      valueType: 'option',
      render: (text, record) => getOperationMenu(record)
    },
  ];

  const getOperationMenu = (record) => {
    if (initialState.currentUser?.type !== 3)
      return <a key="primary" onClick={() => handleView(record)}>查看</a>;
    if (record.status === 0){
      const menu = [<a key="primary" onClick={() => handleUpdate(record)}>修改草稿</a>];
      if (record.returnHistory){
        menu.push(<a key="primary" onClick={() => handleReturnReason(record)}>回退原因</a>);
      }
      return menu;
    }
    return [
      <a key="primary" href={serverapi + printReccApi + 'mgmt/' + record.id}>打印推荐表</a>,
      // <input id="upload" key='upload' type="file" ref={refUploadReccForm} style={{display: 'none'}}/>,
      <a key="primary" id='upload_link' onClick={(event) => handleUploadReccForm(event, record)}>上传推荐表</a>,
      <Upload key='uploadreccform' ref={refUploadReccForm} />
    ]
  }

  const handleReturnReason = (record) => {
    notification['info']({
      message: '退回原因 - ' + record.returnHistory.reason,
      duration: 0
    });
  }

  const handleUploadReccForm = (event, record) => {
    setEditObj(record);
    setUploadReccFormVisible(true);
  }

  //判断是什么类型的数据, 然后显示对应的界面
  const handleUpdate = (record) => {
    setEditObj(record);
    if (record.applyType == '1'){
      setORGModalTitle('编辑草稿');
      setORGViewMode(false);
      setORGModalVisible(true);
    } else if (record.applyType == '2'){
      setIndividualModalTitle('编辑草稿');
      setIndividualViewMode(false);
      setIndividualModalVisible(true);
    }
  }

  const handleView = (record) => {
    setEditObj(record);
    if (record.applyType == '1'){
      setORGModalTitle('科普管理 - ' + record.deptName);
      setORGViewMode(true);
      setORGModalVisible(true);
    } else if (record.applyType == '2'){
      setIndividualModalTitle('科普管理 - ' + record.name);
      setIndividualViewMode(true);
      setIndividualModalVisible(true);
    }
  }

  const handleAddORG = async () => {
    if (initialState.currentUser?.type !== 3){
      message.error("请使用申报单位帐号提交");
      return;
    }
    //每个帐号只能添加一个
    const records = await queryData({"current": 1, "pageSize": 1});
    if (records && records.data && records.data.length > 0){
      message.error("每个帐号只可以申报一个记录.");
      return;
    }
    setORGModalTitle('添加优秀健康科普-组织机构申报');
    setEditObj({});//传递一个空对象
    setORGViewMode(false);
    setORGModalVisible(true);
  }

  const handleAddIndividual = async () => {
    if (initialState.currentUser?.type !== 3){
      message.error("请使用申报单位帐号提交");
      return;
    }
    //每个帐号只能添加一个
    const records = await queryData({"current": 1, "pageSize": 1});
    if (records && records.data && records.data.length > 0){
      message.error("每个帐号只可以申报一个记录.");
      return;
    }
    setIndividualModalTitle('添加优秀健康科普-个人申报');
    setEditObj({});//传递一个空对象
    setIndividualViewMode(false);
    setIndividualModalVisible(true);
  }

  const queryData = async (params) => {
    const ps = await getPopsciMgmt(params);
    // setExistsWorks(works.data && works.data.length > 0);
    return ps;
  }

  const handleSaveFinish = () => {
    actionRef.current.reload();//刷新表格
    setORGModalVisible(false);
    setIndividualModalVisible(false);
  }

  const handleAttachReport = () => {
    setUploadReccFormVisible(false);
    actionRef.current.reload();
  }

  const getToolBar = () => {
    if (initialState.currentUser?.type === 3){
      if (access.canAddMgmtOrg) {
        return [
          <Button type="primary" key="addORG" onClick={() => handleAddORG()}>
            <PlusOutlined/> 添加优秀健康科普管理(组织机构)
          </Button>
        ];
      }
      if (access.canAddMgmtIndividual) {
        return [
          <Button type="primary" key="addIndividual" onClick={() => handleAddIndividual()}>
            <PlusOutlined/> 添加优秀健康科普管理(个人)
          </Button>
        ]
      }
    } else if (initialState.currentUser?.type === 1){
      return [
          <Button type="primary" key="export"
                  disabled={initialState.currentUser?.type !== 1}
                  onClick={() => handleExport()}>
            <DownloadOutlined /> 导出
          </Button>
        ]
    }
  }

  const handleExport = () => {
    const href = serverapi + exportMgmtApi;
    const link = document.createElement('a');
    const evt = document.createEvent('MouseEvents');
    link.style.display='none';
    link.href = href;
    document.body.append(link);
    evt.initEvent('click', false, false);
    link.dispatchEvent(evt);
    document.body.removeChild(link);
  }

  return (
    <PageContainer>
      <ProTable
        rowKey="id"
        actionRef={actionRef}
        search={{
          labelWidth: 120,
          collapsed:false
        }}
        toolBarRender={getToolBar}
        request={(params) => queryData(params)}
        columns={columns}
      />
      <PopsciMgmtORGModal
        onCancel={() => setORGModalVisible(false)}
        closeModal={() => setORGModalVisible(false)}
        onSaveFinish={handleSaveFinish}
        modalTitle={orgModalTitle}
        editObj={editObj}
        viewMode={orgViewMode}
        visible={orgModalVisible}
      />
      <PopsciMgmtIndividualModal
        onCancel={() => setIndividualModalVisible(false)}
        closeModal={() => setIndividualModalVisible(false)}
        onSaveFinish={handleSaveFinish}
        modalTitle={individualModalTitle}
        editObj={editObj}
        viewMode={individualViewMode}
        visible={individualModalVisible}
      />
      <UploadReccFormModal
        onCancel={() => setUploadReccFormVisible(false)}
        closeModal={() => setUploadReccFormVisible(false)}
        onUploadFinish={() => handleAttachReport()}
        editObj={editObj}
        modalTitle={editObj.applyType == 1 ? editObj.deptName : editObj.name}
        objectType='mgmt'
        visible={uploadReccFormVisible}/>
    </PageContainer>
  )
}

export default TableList;
