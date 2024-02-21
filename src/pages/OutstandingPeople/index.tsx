import React, {useRef, useState} from "react";
import {PageContainer} from "@ant-design/pro-layout";
import {Button, message, notification, Select, Upload} from "antd";
import ProTable from "@ant-design/pro-table";
import {DownloadOutlined, PlusOutlined} from "@ant-design/icons";
import {exportPeopleApi, getOutstandingPeople, printReccApi} from "@/services/ant-design-pro/api";
import {useModel} from "umi";
import OutstandingPeopleModal from "@/pages/OutstandingPeople/component/OutstandingPeopleModal";
import UploadReccFormModal from "@/pages/component/UploadReccFormModal";

const TableList = () => {
  const actionRef = useRef();
  const { initialState, setInitialState } = useModel('@@initialState');
  const [modalTitle, setModalTitle] = useState('添加科普人物');
  const [editObj, setEditObj] = useState({});
  const [viewMode, setViewMode] = useState(false); //以查看模式打开窗口
  const [modalVisible, setModalVisible] = useState(false);
  const [uploadReccFormVisible, setUploadReccFormVisible] = useState(false);
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 100,
      hideInTable: true,
      hideInSearch: true,
      key: 'ID'
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 200
    },
    {
      title: '申报类别',
      dataIndex: 'applyType',
      key: 'applyType',
      width: 200,
      renderText: (text) => {
        switch (text) {
          case 1: return '特别贡献人物';
          case 2: return '杰出人物';
          case 3: return '新锐人物';
          default: return '';
        }
      },
      renderFormItem: () => {
        return (
          <Select style={{width:300}}>
            <Select.Option value="1" key={11}>特别贡献人物</Select.Option>
            <Select.Option value="2" key={12}>杰出人物</Select.Option>
            <Select.Option value="3" key={13}>新锐人物</Select.Option>
          </Select>
        )
      }
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
      width: 200,
      hideInSearch: true,
      renderText: (text) => text == '1'? '男' : (text == '2' ? '女' : '')
    },
    {
      title: '民族',
      dataIndex: 'race',
      key: 'race',
      width: 200,
      hideInSearch: true
    },
    {
      title: '生日',
      dataIndex: 'birth',
      key: 'birth',
      width: 200,
      hideInSearch: true
    },
    {
      title: '学历',
      dataIndex: 'eduDegree',
      key: 'eduDegree',
      width: 200,
      hideInSearch: true,
      renderText: (text) => {
        switch (text){
          case 1: return "小学";
          case 2: return "初中";
          case 3: return "高中";
          case 4: return "大专";
          case 5: return "大学本科";
          case 6: return "研究生";
          case 7: return "博士";
        }
      }
    },
    {
      title: '手机号码',
      dataIndex: 'phone',
      key: 'phone',
      width: 200
    },
    {
      title: '工作单位',
      dataIndex: 'company',
      key: 'company',
      width: 200
    },
    {
      title: '职务',
      dataIndex: 'position',
      key: 'position',
      width: 200,
      hideInSearch: true
    },
    {
      title: '职称',
      dataIndex: 'title',
      key: 'title',
      width: 200,
      hideInSearch: true
    },
    {
      title: '通讯地址',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      hideInSearch: true
    },
    {
      title: '电子邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      hideInSearch: true
    },
    {
      title: '从事专业/领域',
      dataIndex: 'domain',
      key: 'domain',
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
  const refUploadReccForm = useRef();

  const getOperationMenu = (record) => {
    if (initialState.currentUser?.type !== 3)
      return <a key="primary" onClick={() => handleView(record)}>查看</a>;
    if (record.status === 0) {
      const menu = [<a key="primary" onClick={() => handleUpdate(record)}>修改草稿</a>];
      if (record.returnHistory){
        menu.push(<a key="primary" onClick={() => handleReturnReason(record)}>回退原因</a>);
      }
      return menu;
    }

    return [
      <a key="primary" href={serverapi + printReccApi + 'people/' + record.id}>打印推荐表</a>,
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

  const handleUpdate = (record) => {
    setEditObj(record);
    setModalTitle('编辑草稿');
    setViewMode(false);
    setModalVisible(true);
  }

  const handleView = (record) => {
    setEditObj(record);
    setModalTitle('科普人物 - ' + record.name);
    setViewMode(true);
    setModalVisible(true);
  }

  const handleAdd = async () => {
    if (initialState.currentUser?.type !== 3){
      message.error("请使用申报单位帐号提交");
      return;
    }
    //每个帐号只能添加一个
    const people = await queryData({"current": 1, "pageSize": 1});
    if (people?.data?.length > 0){
      message.error("每个帐号只可以申报一个记录.");
      return;
    }
    setModalTitle('添加科普人物');
    setEditObj({});//传递一个空对象
    setViewMode(false);
    setModalVisible(true);
  }

  const queryData = async (params) => {
    const people = await getOutstandingPeople(params);
    return people;
  }

  const handleSaveFinish = () => {
    actionRef.current.reload();//刷新表格
    setModalVisible(false);
  }

  const handleAttachReport = () => {
    setUploadReccFormVisible(false);
    actionRef.current.reload();
  }

  const getToolBar = () => {
    if (initialState.currentUser?.type === 3)
      return ([
        <Button type="primary" key="add" onClick={() => handleAdd()}>
          <PlusOutlined /> 添加科普人物
        </Button>
      ])
    else if (initialState.currentUser?.type === 1) //只有管理员能够导出作品
      return ([
        <Button type="primary" key="export"
                disabled={initialState.currentUser?.type !== 1}
                onClick={() => handleExport()}>
          <DownloadOutlined /> 导出
        </Button>
      ])
  }

  const handleExport = () => {
    const href = serverapi + exportPeopleApi;
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
      <OutstandingPeopleModal
        onCancel={() => setModalVisible(false)}
        closeModal={() => setModalVisible(false)}
        onSaveFinish={handleSaveFinish}
        modalTitle={modalTitle}
        editObj={editObj}
        viewMode={viewMode}
        visible={modalVisible}
      />
      <UploadReccFormModal
        onCancel={() => setUploadReccFormVisible(false)}
        closeModal={() => setUploadReccFormVisible(false)}
        onUploadFinish={() => handleAttachReport()}
        editObj={editObj}
        modalTitle={editObj.name}
        objectType='people'
        visible={uploadReccFormVisible}/>
    </PageContainer>
  )
}

export default TableList;
