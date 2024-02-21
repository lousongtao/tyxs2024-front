import {
  Button, Card,
  Col, DatePicker,
  Form,
  Input,
  message,
  Modal,
  notification,
  Popconfirm,
  Radio,
  Row, Select,
  Space,
  Spin, Upload
} from "antd";
import {
  addOutstandingPeople, API_UPLOADFILE, deleteTempFile,
  returnOutstandingPeople,
  updateOutstandingPeople
} from "@/services/ant-design-pro/api";
import React, {useEffect, useState} from "react";
import ExperienceTable from "@/pages/component/ExperienceTable";
import SubsidizeTable from "@/pages/component/SubsidizeTable";
import PrizeTable from "@/pages/component/PrizeTable";
import {UploadOutlined} from "@ant-design/icons";
import moment from "moment";
import {createStyles} from "antd-style";
import ReturnConfirmModal from "@/pages/component/ReturnConfirmModal";

const OutstandingPeopleModal = (props) => {
  const acceptFileType = 'image/jpg,image/jpeg,image/gif,image/png,image/bmp,application/pdf,' +
    'text/html,text/htm,text/plain,video/avi,video/mp4,video/wmv,video/wma,video/avi,audio/mpeg,' +
    'application/vnd.ms-excel,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,' +
    'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  const unacceptFileType = 'qsv,qlv,rar,zip,7z,tar';
  const [form] = Form.useForm();
  const [loadData, setLoadData] = useState(false);//页面加载时启动等待框, 加载数据
  const [applyTypeValue, setApplyTypeValue] = useState();
  const [eduDegree, setEduDegree] = useState();
  const [genderValue, setGenderValue] = useState();
  const [fileList, setFileList] = React.useState([]);
  const [editObj, setEditObj] = useState({}); //记录当前编辑对象, 对于Add的界面, 是个空对象.
  const [returnConfirmModalVisible, setReturnConfirmModalVisible] = useState(false);
  const handleSave = async (status) => {
    try{
      const values = await form.validateFields();
      if (values.errorFields){
        message.error("数据输入不完整");
        return;
      }
    } catch (e) {
      message.error("数据验证失败");
      return;
    }

    const payload = {
      ...form.getFieldsValue(),
      status,
      fileUrl: fileList.length === 0 ? null : fileList[0].response
    }
    setLoadData(true);
    //把editObj对象上面的experience, prize, subsidize 信息加入payload.
    payload.experienceList = editObj.experienceList;
    payload.prizeList = editObj.prizeList;
    payload.subsidizeList = editObj.subsidizeList;

    try{
      let people = null;
      if (props.editObj.id){
        payload.id = props.editObj.id;
        people = await updateOutstandingPeople(payload);
      } else {
        people = await addOutstandingPeople(payload);
      }

      setLoadData(false);
      if (people){
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
      let people = await returnOutstandingPeople(editObj.id, returnReason);

      setLoadData(false);
      if (people){
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

  const buildForm = () => {
    return (
      <Form
        style={{margin: 7}}
        labelCol={{span: 6}}
        wrapperCol={{span: 14}}
        form={form}
        scrollToFirstError>
        <Row>
          <Col span={16}>
            <Form.Item name="applyType" label="申报类别" rules={[{required: true,message: '请选择申报类别'}]} >
              <Radio.Group onChange={(e) => setApplyTypeValue(e.target.value)} value={applyTypeValue} disabled={props.viewMode}>
                <Space>
                  <Radio value={2}>杰出人物</Radio>
                  <Radio value={3}>新锐人物</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item
              name="name"
              label="姓名"
              rules={[{required: true,message: '请输入姓名',whitespace: true}]}>
              <Input style={{width:200}} disabled={props.viewMode}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name="gender" label="性别" rules={[{required: true,message: '请选择性别'}]} >
              <Radio.Group onChange={(e) => setGenderValue(e.target.value)} value={genderValue} disabled={props.viewMode}>
                <Space>
                  <Radio value={1}>男</Radio>
                  <Radio value={2}>女</Radio>
                </Space>
              </Radio.Group>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              name="race"
              label="民族"
              rules={[{required: true,message: '请输入民族'}]}>
              <Input style={{width:200}} disabled={props.viewMode}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="birth"
              label="生日"
              rules={[{required: true,message: '请输入生日'}]}
              >
              <DatePicker disabled={props.viewMode}/>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              name="eduDegree"
              label="学历"
              rules={[{required: true,message: '请输入学历'}]}>
              <Select style={{width:200}}>
                <Select.Option value={1} key={1}>小学</Select.Option>
                <Select.Option value={2} key={2}>初中</Select.Option>
                <Select.Option value={3} key={3}>高中</Select.Option>
                <Select.Option value={4} key={4}>大专</Select.Option>
                <Select.Option value={5} key={5}>大学本科</Select.Option>
                <Select.Option value={6} key={6}>研究生</Select.Option>
                <Select.Option value={7} key={7}>博士</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="phone"
              label="手机号码"
              rules={[{required: true,message: '请输入手机号码',whitespace: true}]}>
              <Input style={{width:200}} disabled={props.viewMode}/>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              name="company"
              label="工作单位"
              rules={[{required: true,message: '请输入工作单位'}]}>
              <Input style={{width:400}} disabled={props.viewMode}/>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              name="position"
              label="职务"
              rules={[{required: true,message: '请输入职务'}]}>
              <Input style={{width:200}} disabled={props.viewMode}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="title"
              label="职称"
              rules={[{required: true,message: '请输入职称'}]}>
              <Input style={{width:200}} disabled={props.viewMode}/>
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col span={12}>
            <Form.Item
              name="address"
              label="通讯地址"
              rules={[{required: true,message: '请输入通讯地址'}]}>
              <Input style={{width:400}} disabled={props.viewMode}/>
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <Form.Item
              name="email"
              label="电子邮箱"
              rules={[{required: true,message: '请输入电子邮箱'}]}>
              <Input style={{width:300}} disabled={props.viewMode}/>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="domain"
              label="从事专业/领域"
              rules={[{required: true,message: '请输入从事专业/领域'}]}>
              <Input style={{width:300}} disabled={props.viewMode}/>
            </Form.Item>
          </Col>
        </Row>
        {buildFileUploadComp()}
        {buildFileLink()}



        <Row>
          <Col span={24}>
              <ExperienceTable
                experienceList={editObj.experienceList ? editObj.experienceList : []}
                onChangeExpr={(experienceList) => editObj.experienceList = experienceList}
                onDeleteExpr={(experienceList) => editObj.experienceList = experienceList}
                disabled={props.viewMode}
              />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
              <PrizeTable
                prizeList={editObj.prizeList ? editObj.prizeList : []}
                onChangePrize={(prizeList) => editObj.prizeList = prizeList}
                onDeletePrize={(prizeList) => editObj.prizeList = prizeList}
                disabled={props.viewMode}
              />
          </Col>
        </Row>
        <Row>
          <Col span={24}>
              <SubsidizeTable
                subsidizeList={editObj.subsidizeList ? editObj.subsidizeList : []}
                onChangeSubsidize={(subsidizeList) => editObj.subsidizeList = subsidizeList}
                onDeleteSubsidize={(subsidizeList) => editObj.subsidizeList = subsidizeList}
                disabled={props.viewMode}
              />
          </Col>
        </Row>
        <Row>
          <Col span={24} >
            <Card title="申报人情况" bordered={false} style={{ width: '100%' }}>
              <Form.Item name="projectBrief" label="项目综述" labelCol={4} wrapperCol={20}
                         rules={[{required: true,message: '请输入项目综述',whitespace: true}]}>
                <Input.TextArea
                  showCount
                  rows={6}
                  maxLength={500}
                  placeholder="请高度概括项目申报人从事健康科普相关工作的亮点特色、项目及社会贡献等"
                  disabled={props.viewMode}/>
              </Form.Item>
              <Form.Item name="projectDesc" label="项目介绍" labelCol={4} wrapperCol={20}
                         rules={[{required: true,message: '请输入项目介绍',whitespace: true}]}>
                <Input.TextArea
                  showCount
                  rows={14}
                  maxLength={2000}
                  placeholder="请详细说明相关申报人的健康科普工作情况，包括但不限于：具有典型代表性的科普项目成果、内容、特色，在科普队伍建设、科普公益等方面的工作情况，项目产生的社会效益等"
                  disabled={props.viewMode} />
              </Form.Item>
            </Card>
          </Col>
        </Row>
      </Form>
    )
  }

  /**
   * 添加/修改状态下, 显示"上传文件"按钮
   */
  const buildFileUploadComp = () => {
    if (!props.viewMode){
      return (
        <Row>
          <Col span={12}>
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
          </Col>
        </Row>

      )
    }
  }

  /**
   * 查看 状态下, 给管理员/推荐单位 提供一个查看文件的链接
   */
  const buildFileLink = () => {
    if (props.viewMode){
      return (
        <Row>
          <Col span={12}>
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
          </Col>
        </Row>
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
    if (file.status === 'done') {
      fileList.push(file);
      // setAttachment(fileList?.map(f => f.response));
    } else if (file.status === 'error'){
      message.error('文件上传错误.');
    }
  };

  const handleUploadRemove = (file) => {
    const index = fileList.indexOf(file);
    const newFileList = fileList.slice();
    newFileList.splice(index, 1);
    setFileList(newFileList);
    // setAttachment((newFileList && newFileList.length > 0) ? newFileList.map(f => f.response) : undefined);
    const fileName = deleteTempFile(file.response);
  };

  const handleBeforeUpload = (file) => {
    if (fileList.length > 0){
      message.error('只能上传一个文件.');
      return Upload.LIST_IGNORE;
    }
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
      if (props.editObj?.birth){
        // 2023-03-26
        // 日期数据在查看状态下会出现date.clone is not a function
        // 如果在Form.Item中增加valuePropName={'date'}, 可以消除这个错误, 但是查看不到日期值, 这里只能采用moment的方式修改这个值,
        // 再使用form的setFieldValue方法把值填入.
        // 奇怪的是, 原始版本的作品功能同样有日期控件, 但是没有这个错误现象.
        props.editObj.birth = moment(props.editObj.birth);
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

  const handleCancelReturn = () => {
    setReturnConfirmModalVisible(false);
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

export default OutstandingPeopleModal;
