import {PageContainer} from "@ant-design/pro-layout";
import ProTable from "@ant-design/pro-table";
import React, {useEffect, useRef, useState} from "react";
import {
  exportWorksApi,
  getAccounts,
  getDict,
  getWorks, printReccApi
} from "@/services/ant-design-pro/api";
import './index.less';
import {Button, Select, message, Modal, Upload, notification} from "antd";
import {DownloadOutlined, PlusOutlined} from "@ant-design/icons";
import {useModel} from "umi";
import WorksModal from "@/pages/WorksMgmt/component/WorksModal";
import moment from "moment";
import UploadReccFormModal from "@/pages/component/UploadReccFormModal";
import ViewModal from "@/pages/WorksMgmt/component/ViewModal";

const TableList = () => {
  const [reccDepts, setReccDepts] = useState([]);
  const [worksModalVisible, setWorksModalVisible] = useState(false);
  const [uploadReccFormVisible, setUploadReccFormVisible] = useState(false);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [worksModalTitle, setWorksModalTitle] = useState();
  // const [existsWorks, setExistsWorks] = useState(false); //如果该帐户下有作品, 禁止上传第二件作品
  //要编辑的作品记录, 初始为空对象. 保存成功后初始化这个值为空; 点击修改时, 把表格中记录传递个弹出窗口
  const [editObj, setEditObj] = useState({});
  const [workTypes, setWorkTypes] = useState([]);
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 100,
      hideInTable: true,
      hideInSearch: true
    },
    {
      title: '标题',
      dataIndex: 'title',
      width: 200,
      hideInSearch: true
    },
    {
      title: '作者',
      dataIndex: 'poster',
      width: 200
    },
    {
      title: '类别',
      dataIndex: 'type',
      width: 300,
      valueType: 'select',
      renderText: (text) => {
        for (let i = 0; i < workTypes.length; i++) {
          if (workTypes[i].value == text)
            return workTypes[i].name;
        }
        return text;
      },
      renderFormItem: () => {
        return (
          <Select style={{width:300}}>
            <Select.OptGroup label="图文类" key={1}>
              <Select.Option value="11" key={11}>科普文章</Select.Option>
              <Select.Option value="12" key={12}>漫画</Select.Option>
              <Select.Option value="13" key={13}>海报折页</Select.Option>
              <Select.Option value="14" key={14}>其它</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="图书类" key={4}>
              <Select.Option value={41} key={41}>图书类</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="音频类" key={2}>
              <Select.Option value="21" key={21}>专题音频</Select.Option>
              <Select.Option value="22" key={22}>广播剧</Select.Option>
              <Select.Option value="23" key={23}>有声书</Select.Option>
              <Select.Option value="24" key={24}>其他</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="视频类" key={3}>
              <Select.Option value="31" key={31}>单集作品 - 短视频(小于10分钟)</Select.Option>
              <Select.Option value="32" key={32}>单集作品 - 长视频(大于10分钟)</Select.Option>
              <Select.Option value="33" key={33}>系列作品 - 短视频(小于10分钟)</Select.Option>
              <Select.Option value="34" key={34}>系列作品 - 长视频(大于10分钟)</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="舞台表演类" key={5}>
              <Select.Option value={51} key={51}>演讲</Select.Option>
              <Select.Option value={52} key={52}>脱口秀</Select.Option>
              <Select.Option value={53} key={53}>舞台剧</Select.Option>
            </Select.OptGroup>
          </Select>
        )
      }
    },
    {
      title: '制作单位',
      dataIndex: 'vendor',
      search: false,
      width: 200
    },
    {
      title: '推荐单位',
      dataIndex: 'tjdw',
      width: 200,
      hideInTable: true,
      hideInSearch: true,
      renderFormItem: () => {
        return (
          <Select style={{width:200}}>
            {reccDepts.map(rd => {
              return <Select.Option key={rd.id} value={rd.id}>{rd.name}</Select.Option>
            })}
          </Select>
        )
      }
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
      return <a key="primary" onClick={() => handleViewWorks(record)}>查看</a>;
    if (record.status === 0){
      const menu = [<a key="primary" onClick={() => handleUpdateWorks(record)}>修改草稿</a>];
      if (record.returnHistory){
        menu.push(<a key="primary" onClick={() => handleReturnReason(record)}>回退原因</a>);
      }
      return menu;
    }

    return [
      <a key="primary" href={serverapi + printReccApi + 'works/' + record.id}>打印推荐表</a>,
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

  const handleAddWorks = async () => {
    if (initialState.currentUser?.type !== 3){
      message.error("请使用申报单位帐号提交");
      return;
    }
    // if (existsWorks){
    //   message.error("一个帐号仅限上传一次");
    //   return;
    // }
    //每个帐号只能添加一个
    const works = await queryWorks({"current": 1, "pageSize": 1});
    if (works && works.data && works.data.length > 0){
      message.error("每个帐号只可以申报一个记录.");
      return;
    }
    setWorksModalTitle('上传作品');
    setEditObj({});//传递一个空对象
    setWorksModalVisible(true);
  }

  const handleExportWorks = async () => {
    const href = serverapi + exportWorksApi;
    const link = document.createElement('a');
    const evt = document.createEvent('MouseEvents');
    link.style.display='none';
    link.href = href;
    document.body.append(link);
    evt.initEvent('click', false, false);
    link.dispatchEvent(evt);
    document.body.removeChild(link);
  }

  const handleUpdateWorks = (record) => {
    if (record.mediaPlayDate){
      record.mediaPlayDate = moment(record.mediaPlayDate);
    }
    setEditObj(record);
    setWorksModalTitle('编辑草稿');
    setWorksModalVisible(true);
  }

  const handleViewWorks = (record) => {
    if (record.mediaPlayDate){
      record.mediaPlayDate = moment(record.mediaPlayDate);
    }
    setEditObj(record);
    setViewModalVisible(true);
  }

  const handleAttachReport = () => {
    setUploadReccFormVisible(false);
    actionRef.current.reload();
  }

  const handleSaveFinish = () => {
    actionRef.current.reload();//刷新表格
    setWorksModalVisible(false);
  }

  const handleReturn = () => {
    actionRef.current.reload();//刷新表格
    setViewModalVisible(false)
  }

  //筛选出推荐单位
  useEffect(() =>{
    const fetchData = async () => {
      const accounts = await getAccounts({current: 1, pageSize: 1000});
      const list = [];
      accounts.data.map(a => {
        if (a.type === 2) {
          list.push(a);
        }
        setReccDepts(list);
      });
    }
    fetchData();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const dicts = await getDict();
      const workTypes = dicts.filter(d => d.type==='work_type');
      setWorkTypes(workTypes);
    }
    fetchData();
  }, []);

  const actionRef = useRef();
  const { initialState, setInitialState } = useModel('@@initialState');

  const queryWorks = async (params) => {
    const works = await getWorks(params);
    // setExistsWorks(works.data && works.data.length > 0);
    return works;
  }

  const getToolBar = () => {
    if (initialState.currentUser?.type === 3)
      return ([
            <Button type="primary" key="add" onClick={() => handleAddWorks()}>
              <PlusOutlined /> 上传作品
            </Button>
        ])
    else if (initialState.currentUser?.type === 1) //只有管理员能够导出作品
      return ([
        <Button type="primary" key="export"
                disabled={initialState.currentUser?.type !== 1}
                onClick={() => handleExportWorks()}>
          <DownloadOutlined /> 导出
        </Button>
      ])
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
        request={(params) => queryWorks(params)}
        columns={columns}
      />
      <WorksModal
        onCancel={() => setWorksModalVisible(false)}
        closeModal={() => setWorksModalVisible(false)}
        onSaveFinish={handleSaveFinish}
        modalTitle={worksModalTitle}
        editObj={editObj}
        visible={worksModalVisible}/>
      <UploadReccFormModal
        onCancel={() => setUploadReccFormVisible(false)}
        closeModal={() => setUploadReccFormVisible(false)}
        onUploadFinish={() => handleAttachReport()}
        editObj={editObj}
        modalTitle={editObj.title}
        objectType='works'
        visible={uploadReccFormVisible}/>
      <ViewModal
        onCancel={() => setViewModalVisible(false)}
        closeModal={() => setViewModalVisible(false)}
        editObj={editObj}
        onReturn={handleReturn}
        visible={viewModalVisible}/>
    </PageContainer>
  )
}

export default TableList;
