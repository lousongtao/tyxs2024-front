import {
  Button, Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  notification,
  Popconfirm,
  Radio,
  Row,
  Space,
  Spin, Upload
} from "antd";
import {addBrand, API_UPLOADFILE, deleteTempFile, returnBrand, updateBrand} from "@/services/ant-design-pro/api";
import React, {useEffect, useState} from "react";
import PrizeTable from "@/pages/component/PrizeTable";
import SubsidizeTable from "@/pages/component/SubsidizeTable";
import {UploadOutlined} from "@ant-design/icons";
import ReturnConfirmModal from "@/pages/component/ReturnConfirmModal";

const BrandModal = (props) => {
  const acceptFileType = 'image/jpg,image/jpeg,image/gif,image/png,image/bmp,application/pdf,' +
    'text/html,text/htm,text/plain,video/avi,video/mp4,video/wmv,video/wma,video/avi,audio/mpeg,' +
    'application/vnd.ms-excel,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,' +
    'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  const unacceptFileType = 'qsv,qlv,rar,zip,7z,tar';
  const [form] = Form.useForm();
  const [loadData, setLoadData] = useState(false);//页面加载时启动等待框, 加载数据

  const [editObj, setEditObj] = useState({}); //记录当前编辑对象, 对于Add的界面, 是个空对象.
  const [typeValue, setTypeValue] = useState('');
  const [returnConfirmModalVisible, setReturnConfirmModalVisible] = useState(false);
  const [fileList, setFileList] = React.useState([]);
  const [categoryValue, setCategoryValue] = useState('');
  const handleSave = async (status) => {
    try{
      const values = await form.validateFields();
      if (values.errorFields){
        message.error("数据输入不完整");
        return;
      }
      if (values.type === '其它') {
        if (!values.otherType || !values.otherType.trim()){
          message.error("请输入 类型");
          return;
        }
      }
      if (values.category === '其它') {
        if (!values.otherCategory || !values.otherCategory.trim()){
          message.error("请输入 类别");
          return;
        }
      }
    } catch (e) {
      message.error("数据验证失败");
      console.log(e);
      return;
    }

    const payload = {
      ...form.getFieldsValue(),
      status,
      fileUrl: fileList.length === 0 ? null : fileList[0].response
    }
    if (payload.type === '其它') {
      payload.type = payload.otherType.trim();
    }
    if (payload.category === '其它') {
      payload.category = payload.otherCategory.trim();
    }
    setLoadData(true);

    payload.prizeList = editObj.prizeList;
    payload.subsidizeList = editObj.subsidizeList;

    try{
      let brand = null;
      if (props.editObj.id){
        payload.id = props.editObj.id;
        brand = await updateBrand(payload);
      } else {
        brand = await addBrand(payload);
      }

      setLoadData(false);
      if (brand){
        if (status === 1){
          notification['success']({
            message: '提交成功',
            description: '请打印推荐表，完成推荐单位盖章后上传。',
            duration: 0
          });
        } else if (status === 0)
          message.success("草稿保存成功");
        form.resetFields();
        props.onSaveFinish();
      } else {
        notification['error']({
          message: '提交失败.',
        })
      }
    } catch (error) {
      setLoadData(false);
      notification['error']({
        message: '提交失败.',
        description: error?.info?.message
      })
    }
  };

  const handleReturn = async (returnReason: string) => {
    setLoadData(true);
    setReturnConfirmModalVisible(false);
    try{
      let brand = await returnBrand(editObj.id, returnReason);

      setLoadData(false);
      if (brand){
        if (status == 0){
          notification['success']({
            message: '记录回退成功 - ' + editObj.name,
            duration: 0
          });
        } else notification['error']({message: '提交失败. 状态'+ status });
        form.resetFields();
        props.onSaveFinish();
      } else {
        notification['error']({message: '提交失败.' });
      }
    } catch (error) {
      notification['error']({
        message: '提交失败.',
        description: error?.info?.message
      })
    }
  }

  const handleCancelReturn = () => {
    setReturnConfirmModalVisible(false);
  }

  const buildForm = () => {
    return (
      <Form
        style={{margin: 7}}
        labelCol={{span: 6}}
        wrapperCol={{span: 14}}
        form={form}
        scrollToFirstError>
        <Form.Item
          name="name"
          label="品牌名称"
          rules={[{required: true,message: '请输入品牌名称',whitespace: true}]}>
          <Input style={{width:400}} disabled={props.viewMode}/>
        </Form.Item>
        <Form.Item name="type" label="类型" rules={[{required: true,message: '请选择类型'}]} >
          <Radio.Group
            onChange={(e) => setTypeValue(e.target.value)}
            value={typeValue}
            disabled={props.viewMode}>
            <Space direction="vertical">
              <Radio value='电视科普频道或栏目'>电视科普频道或栏目</Radio>
              <Radio value='广播科普频段或栏目'>广播科普频段或栏目</Radio>
              <Radio value='科普报刊或专栏'>科普报刊或专栏</Radio>
              <Radio value='科普网站'>科普网站</Radio>
              <Radio value='科普新媒体'>科普新媒体</Radio>
              <Radio value='健康科普公益品牌活动或讲座'>健康科普公益品牌活动或讲座</Radio>
              <Radio value='其它'>
                其它
                <Form.Item name="otherType">
                  <Input style={{width:400}} disabled={props.viewMode}/>
                </Form.Item>

              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item name="category" label="归属类别" rules={[{required: true,message: '请选择归属类别'}]} >
          <Radio.Group
            onChange={(e) => setCategoryValue(e.target.value)}
            value={categoryValue}
            disabled={props.viewMode}>
            <Space direction="vertical">
              <Radio value='机构'>机构</Radio>
              <Radio value='科室'>科室</Radio>
              <Radio value='个人'>个人</Radio>
              <Radio value='其它'>
                其它
                <Form.Item name="otherCategory">
                  <Input style={{width:400}} disabled={props.viewMode}/>
                </Form.Item>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="company"
          label="所在单位"
          rules={[{required: true,message: '请输入所在单位',whitespace: true}]}>
          <Input style={{width:400}} disabled={props.viewMode}/>
        </Form.Item>
        <Form.Item
          name="contactPerson"
          label="联系人"
          rules={[{required: true,message: '请输入联系人',whitespace: true}]}>
          <Input style={{width:400}} disabled={props.viewMode}/>
        </Form.Item>
        <Form.Item
          name="phone"
          label="手机"
          rules={[{required: true,message: '请输入手机',whitespace: true}]}>
          <Input style={{width:400}} disabled={props.viewMode}/>
        </Form.Item>
        <Form.Item
          name="email"
          label="电子邮箱"
          rules={[{required: true,message: '请输入电子邮箱',whitespace: true}]}>
          <Input style={{width:400}} disabled={props.viewMode}/>
        </Form.Item>
        <Form.Item
          name="address"
          label="通信地址"
          rules={[{required: true,message: '请输入通信地址',whitespace: true}]}>
          <Input style={{width:400}} disabled={props.viewMode}/>
        </Form.Item>
        {buildFileUploadComp()}
        {buildFileLink()}
        <Row>
          <Col span={24}>
            <PrizeTable
              prizeList={editObj.prizeList ? editObj.prizeList : []}
              onChangePrize={(prizeList) => editObj.prizeList = prizeList}
              onDeletePrize={(prizeList) => editObj.prizeList = prizeList}
              disabled={props.viewMode} />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <SubsidizeTable
              subsidizeList={editObj.subsidizeList ? editObj.subsidizeList : []}
              onChangeSubsidize={(subsidizeList) => editObj.subsidizeList = subsidizeList}
              onDeleteSubsidize={(subsidizeList) => editObj.subsidizeList = subsidizeList}
              disabled={props.viewMode} />
          </Col>
        </Row>

        <Card title="申报项目情况" bordered={false} style={{ width: '100%' }}>
          <Form.Item name="projectBrief" label="项目综述" labelCol={4} wrapperCol={20}
                     rules={[{required: true,message: '请输入项目综述',whitespace: true}]}>
            <Input.TextArea
              showCount
              rows={6}
              maxLength={500}
              placeholder="请高度概括申报项目品牌的内容、亮点特色及社会影响等"
              disabled={props.viewMode}/>
          </Form.Item>
          <Form.Item name="projectDesc" label="项目介绍" labelCol={4} wrapperCol={20}
                     rules={[{required: true,message: '请输入项目介绍',whitespace: true}]}>
            <Input.TextArea
              showCount
              rows={14}
              maxLength={2000}
              placeholder="请详细说明科普品牌的背景、内容、成果实施、应用和普及情况，产生的社会效益及贡献等"
              disabled={props.viewMode} />
          </Form.Item>
        </Card>
      </Form>
    )
  }

  /**
   * 添加/修改状态下, 显示"上传文件"按钮
   */
  const buildFileUploadComp = () => {
    if (!props.viewMode){
      return (
        <Form.Item name="attachment" label="相关佐证材料"
                   extra='上传文件大小不超过600M。'>
          <Upload
            action={API_UPLOADFILE}
            defaultFileList={fileList}
            headers={{Authorization: 'Basic ' + sessionStorage.getItem('auth')}}
            onChange={handleUploadChange}
            onRemove={handleUploadRemove}
            beforeUpload={handleBeforeUpload}
          >
            <Button icon={<UploadOutlined />}>上传</Button>
          </Upload>
        </Form.Item>
      )
    }
  }

  /**
   * 查看 状态下, 给管理员/推荐单位 提供一个查看文件的链接
   */
  const buildFileLink = () => {
    if (props.viewMode){
      return (
        <>
          <Form.Item
            name="worksLink"
            label="材料">
            {getFileUrlLink()}
          </Form.Item>
          <Form.Item
            name="worksLink"
            label="推荐表">
            {getReccFormUrlLink()}
          </Form.Item>
        </>
      )
    }
  }

  //java 保存的路径中, 有时候正斜线, 有时候反斜线
  const getFileUrlLink = () => {
    if (editObj?.fileUrl){
      const segs = editObj.fileUrl.replace(/\\/g, '/').split('/WorksFiles/');
      return <a href={'http://workscollect.shbxjk.cn/WorksFiles/' + segs[1]} target='_blank'>点击查看</a>
    }
    return <></>
  }

  //java 保存的路径中, 有时候正斜线, 有时候反斜线
  const getReccFormUrlLink = () => {
    if (editObj?.reccFormFileUrl){
      const segs = editObj.reccFormFileUrl.replace(/\\/g, '/').split('/WorksReccForm/');
      return <a href={'http://workscollect.shbxjk.cn/WorksReccForm/' + segs[1]} target='_blank'>点击查看</a>
    }
    return <h4 style={{color: 'red'}}>申报单位未提交推荐表</h4>
  }

  const handleUploadChange = ({ file }) => {
    console.log('handleUploadChange')
    if (file.status === 'done') {
      fileList.push(file);
      // setAttachment(fileList?.map(f => f.response));
    } else if (file.status === 'error'){
      message.error('文件上传错误.');
    }
  };

  const handleUploadRemove = (file) => {
    console.log('handleUploadRemove')
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
    // setAttachment((newFileList && newFileList.length > 0) ? newFileList.map(f => f.response) : undefined);
    const fileName = deleteTempFile(file.response);
  };

  const handleBeforeUpload = (file) => {
    console.log('handleBeforeUpload')
    if (fileList.length > 0){
      message.error('只能上传一个文件.');
      return Upload.LIST_IGNORE;
    }
    // const nameseg = file.name.split('.');
    // if (unacceptFileType.indexOf(nameseg[nameseg.length - 1]) >= 0){
    //   message.error('不支持上传该文件格式. ' + nameseg[nameseg.length - 1]);
    //   return Upload.LIST_IGNORE;
    // }
    // if (acceptFileType.indexOf(file.type) < 0){
    //   message.error('不支持上传该文件格式. ' + file.type);
    //   return Upload.LIST_IGNORE;
    // }
    return true;
  }

  /**
   * effect不能用props.editWorks做检查判断, 如果连续编辑同一条记录导致对象无变化的话, effect就不会重复执行.
   * effect不能只执行一次, 第一次执行是在父类初始化的时候. 要求每次改变props值都要执行一次
   */
  useEffect(() => {
    if (props.editObj !== editObj){
      //要先把form清空, 再重新设置新的值, 否则当add的时候, 传入空对象, 无法覆盖之前的显示
      form.resetFields();

      //如果选项是"其他", 这里要手动转化
      if (props.editObj.type != '电视科普频道或栏目' &&
        props.editObj.type != '广播科普频段或栏目' &&
        props.editObj.type != '科普报刊或专栏' &&
        props.editObj.type != '科普网站' &&
        props.editObj.type != '科普新媒体' &&
        props.editObj.type != '健康科普公益品牌活动或讲座'){
        props.editObj.otherType = props.editObj.type;
        props.editObj.type = '其它';
      }
      if (props.editObj.category != '机构' && props.editObj.category != '科室' && props.editObj.category != '个人'){
        props.editObj.otherCategory = props.editObj.category;
        props.editObj.category = '其它';
      }
      form.setFieldsValue(props.editObj);

      //这里会导致effect进入死循环, set方法修改upload控件, 然后触发下一轮effect, 需要用判断句式终止不停的set
      if (props.editObj.fileUrl){
        const segs = props.editObj.fileUrl.split('\\');
        const fileName = segs[segs.length - 1];
        const file = {
          uid: '1',
          name: fileName,
          status: 'done',
          response: props.editObj.fileUrl
        }
        fileList[0] = file;
      } else if (fileList.length > 0) {
        setFileList([]);
      }

      setEditObj(props.editObj);
    }
  } );

  const handleCancel = () => {
    form.resetFields();
    //reset this obj as null while close this window. If not, 'useEffect' will ignore to set form fields because there is an object compare
    setEditObj({});
    props.onCancel();
  }

  const buildFooter = () => {
    if (props.viewMode){
      let buttons = [
        <Button key="cancel" onClick={props.onCancel}>
          关闭
        </Button>,
      ];
      if (!props.hideReturn){
        buttons.push(
          <Button key='cancel' onClick={() => setReturnConfirmModalVisible(true)}>
            退回
          </Button>
        );
      }
      return buttons;
    } else {
      return (
        [
          <Popconfirm
            key="cancel"
            onConfirm={() => handleCancel()}
            title='确认放弃已编辑过的内容么？'>
            <Button key="cancel">
              取消
            </Button>
          </Popconfirm>,
          <Popconfirm
            key="saveDraft"
            onConfirm={() => handleSave(0)}
            title='确认保存当前内容为草稿？'>
            <Button key="saveDraft" type="primary">
              保存
            </Button>
          </Popconfirm>,
          <Popconfirm
            key="print"
            onConfirm={() => handleSave(1)}
            title='确认提交当前记录？提交后数据不可再修改。'>
            <Button key="print" type="primary">
              提交
            </Button>
          </Popconfirm>
        ]
      )
    }
  }

  return (
    <Spin spinning={loadData}>
      <Modal
        title={props.modalTitle}
        getContainer={false}
        centered
        destroyOnClose
        maskClosable={false}
        visible={props.visible}
        closable={false}
        footer={buildFooter()}
        width={1000}>
        {buildForm()}
      </Modal>
      <ReturnConfirmModal
        visible={returnConfirmModalVisible}
        handleReturn={handleReturn}
        handleCancelReturn={handleCancelReturn}
      />
    </Spin>
  )

}

export default BrandModal;
