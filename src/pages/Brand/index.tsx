import React, { useRef, useState} from "react";
import {PageContainer} from "@ant-design/pro-layout";
import {Button, message, notification, Upload} from "antd";
import ProTable from "@ant-design/pro-table";
import {DownloadOutlined, PlusOutlined} from "@ant-design/icons";
import {exportBrandApi, exportPeopleApi, getBrand, printReccApi} from "@/services/ant-design-pro/api";
import BrandModal from "@/pages/Brand/component/BrandModal";
import {useModel} from "umi";
import UploadReccFormModal from "@/pages/component/UploadReccFormModal";
import {ProColumns} from "@ant-design/pro-components";

const TableList:React.FC = () => {
  const actionRef = useRef();
  const [modalTitle, setModalTitle] = useState<string>('添加品牌');
  const [editObj, setEditObj] = useState<any>({});
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<boolean>(false); //以查看模式打开窗口
  const { initialState, setInitialState } = useModel('@@initialState');
  const [uploadReccFormVisible, setUploadReccFormVisible] = useState<boolean>(false);
  const refUploadReccForm = useRef();
  const columns:ProColumns[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 100,
      hideInTable: true,
      hideInSearch: true
    },
    {
      title: '名称',
      dataIndex: 'name',
      width: 200
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 200,
      hideInSearch: true
    },
    {
      title: '归属类别',
      dataIndex: 'category',
      width: 200,
      hideInSearch: true
    },
    {
      title: '申报单位',
      dataIndex: 'accountName',
      width: 200,
    },
    {
      title: '操作',
      width: 180,
      key: 'option',
      valueType: 'option',
      render: (text: string, record: any) => getOperationMenu(record)
    },
  ];

  const getOperationMenu = (record: any) => {
    console.log('record.status === 0 = ' + (record.status === 0));
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
      <a key="primary" href={serverapi + printReccApi + 'brand/' + record.id}>打印推荐表</a>,
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
    setModalTitle('科普品牌 - ' + record.name);
    setViewMode(true);
    setModalVisible(true);
  }

  const handleAdd = async () => {
    if (initialState.currentUser?.type !== 3){
      message.error("请使用申报单位帐号提交");
      return;
    }
    //每个帐号只能添加一个
    const brands = await queryData({"current": 1, "pageSize": 1});
    if (brands?.data?.length > 0){
      message.error("每个帐号只可以申报一个记录.");
      return;
    }
    setModalTitle('添加科普品牌');
    setEditObj({});//传递一个空对象
    setViewMode(false);
    setModalVisible(true);
  }

  const queryData = async (params) => {
    const brands = await getBrand(params);
    // setExistsWorks(works.data && works.data.length > 0);
    return brands;
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
          <PlusOutlined /> 添加品牌
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
    const href = serverapi + exportBrandApi;
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
        columns={columns} />
      <BrandModal
        onCancel={() => setModalVisible(false)}
        closeModal={() => setModalVisible(false)}
        onSaveFinish={handleSaveFinish}
        modalTitle={modalTitle}
        editObj={editObj}
        viewMode={viewMode}
        visible={modalVisible} />
      <UploadReccFormModal
        onCancel={() => setUploadReccFormVisible(false)}
        closeModal={() => setUploadReccFormVisible(false)}
        onUploadFinish={() => handleAttachReport()}
        editObj={editObj}
        modalTitle={editObj.name}
        objectType='brand'
        visible={uploadReccFormVisible}/>
    </PageContainer>
  )
}

export default TableList;
