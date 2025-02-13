import {
  Button, Card, Col,
  DatePicker,
  Form,
  Input,
  InputNumber,
  message,
  Modal, notification,
  Popconfirm, Radio, Row,
  Select, Space,
  Spin,
  Upload
} from "antd";
import {addWorks, API_UPLOADFILE, deleteTempFile, updateWorks} from "@/services/ant-design-pro/api";
import React, {useEffect} from "react";
import {UploadOutlined} from "@ant-design/icons";
import PrizeTable from "@/pages/component/PrizeTable";
import SubsidizeTable from "@/pages/component/SubsidizeTable";

/**
 * 这里生成一个Modal, 嵌套Form
 * 通过props传递真实的cancel, saveDraft, print方法
 * 这个类内部处理cancel时, 先清理form的内容, 再删除已经上传的文件, 避免服务端积累垃圾文件, 然后再调用props.cancel关闭这个modal
 * 处理saveDraft,print方法, 先获取form数据, 调用接口保存, 成功后调用父类把这个modal的关闭, 否则modal保持打开状态
 *
 * @param props
 * @returns {JSX.Element}
 * @constructor
 */
const WorksModal = (props) => {
  const acceptFileType = 'image/jpg,image/jpeg,image/gif,image/png,image/bmp,application/pdf,' +
    'text/html,text/htm,text/plain,video/avi,video/mp4,video/wmv,video/wma,video/avi,audio/mpeg,' +
    'application/vnd.ms-excel,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,' +
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-powerpoint,' +
    'application/vnd.openxmlformats-officedocument.presentationml.presentation';
  const unacceptFileType = 'qsv,qlv,rar,zip,7z,tar';
  const [form] = Form.useForm();
  const TOPIC_agws = '爱国卫生与健康生活方式';
  const TOPIC_jbfz = '重大疾病防治';
  const TOPIC_rqjk = '重点人群健康';
  const TOPIC_zycj = '中医药健康促进';
  const TOPIC_qita = '其它';
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
    // 提交的时候, 要检查有没有上传作品, 这个是必填项. 如果是保存草稿, 就不做检查了
    if (status === 1 && fileList.length === 0){
      message.error("您还没有上传作品, 无法提交数据进入系统");
      return;
    }

    const payload = {
      ...form.getFieldsValue(),
      status,
      fileUrl: fileList.length === 0 ? null : fileList[0].response
    };

    if (payload.topic === '其它') payload.topic = payload.otherTopic;
    setLoadData(true);//这个要在payload构造之后, 否则改动state会引起effect, 进而form值会更改为最初的值

    payload.prizeList = editObj.prizeList;
    payload.subsidizeList = editObj.subsidizeList;

    try{
      let works = null;
      if (props.editObj.id){
        payload.id = props.editObj.id;
        works = await updateWorks(payload);
      } else {
        works = await addWorks(payload);
      }

      setLoadData(false);
      if (works){
        if (status === 1){
          notification['success']({
            message: '作品提交成功',
            description: '请打印推荐表，完成推荐单位盖章后上传。',
            duration: 0
          });
        } else if (status === 0)
          message.success("草稿保存成功");
        form.resetFields();//提交成功后要把数据都清空
        setFileList([]);
        props.onSaveFinish();
      } else {
        notification['error']({
          message: '作品提交失败.',
        })
      }
    } catch (error) {
      setLoadData(false);
      notification['error']({
        message: '作品提交失败.',
        description: error?.info?.message
      })
    }
  };

  const [loadData, setLoadData] = React.useState(false);//页面加载时启动等待框, 加载数据
  //这个是已上传文件列表, 在修改作品时, 要把已经上传的文件显示在界面上
  const [fileList, setFileList] = React.useState([]);
  const [editObj, setEditObj] = React.useState({}); //记录当前编辑对象, 对于Add的界面, 是个空对象.
  const buildForm = () => {
    return (
      <Form
        style={{margin: 7}}
        labelCol={{span: 6}}
        wrapperCol={{span: 14}}
        form={form}
        scrollToFirstError>
        <Form.Item
          name="title"
          label="标题"
          rules={[{required: true,message: '请输入标题',whitespace: true}]}>
          <Input style={{width:400}}/>
        </Form.Item>
        <Form.Item name="type" label="类别" rules={[{required: true,message: '请选择类别'}]} >
          <Select style={{width:400}}>
            <Select.OptGroup label="图文类" key={1}>
              <Select.Option value={11} key={11}>科普文章</Select.Option>
              <Select.Option value={12} key={12}>漫画</Select.Option>
              <Select.Option value={13} key={13}>海报折页</Select.Option>
              <Select.Option value={14} key={14}>其它</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="图书类" key={4}>
              <Select.Option value={41} key={41}>图书类</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="音频类" key={2}>
              <Select.Option value={21} key={21}>专题音频</Select.Option>
              <Select.Option value={22} key={22}>广播剧</Select.Option>
              <Select.Option value={23} key={23}>有声书</Select.Option>
              <Select.Option value={24} key={24}>其他</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="视频类" key={3}>
              <Select.Option value={31} key={31}>单集作品 - 短视频(小于10分钟)</Select.Option>
              <Select.Option value={32} key={32}>单集作品 - 长视频(大于10分钟)</Select.Option>
              <Select.Option value={33} key={33}>系列作品 - 短视频(小于10分钟)</Select.Option>
              <Select.Option value={34} key={34}>系列作品 - 长视频(大于10分钟)</Select.Option>
            </Select.OptGroup>
            <Select.OptGroup label="舞台表演类" key={5}>
              <Select.Option value={51} key={51}>演讲</Select.Option>
              <Select.Option value={52} key={52}>脱口秀</Select.Option>
              <Select.Option value={53} key={53}>舞台剧</Select.Option>
            </Select.OptGroup>
          </Select>
        </Form.Item>
        <Form.Item name="topic" label="主题" rules={[{required: true,message: '请选择主题'}]} >
          <Radio.Group>
            <Space direction="vertical">
              <Radio value={TOPIC_agws}>{TOPIC_agws}</Radio>
              <Radio value={TOPIC_jbfz}>{TOPIC_jbfz}</Radio>
              <Radio value={TOPIC_rqjk}>{TOPIC_rqjk}</Radio>
              <Radio value={TOPIC_zycj}>{TOPIC_zycj}</Radio>
              <Radio value={TOPIC_qita}>
                {TOPIC_qita}
                <Form.Item name="otherTopic">
                  <Input style={{width:400}} disabled={props.viewMode}/>
                </Form.Item>

              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          name="poster"
          label="作者"
          extra='可填个人或团队，如若作品获奖，该栏信息将作为获奖对象呈现'
          rules={[{required: true,message: '请输入作者',whitespace: true}]}>
          <Input style={{width:200}}/>
        </Form.Item>
        <Form.Item
          name="phone"
          label="作者电话"
          extra='电话号码请输入8-11位数字'
          rules={[{required: true,pattern: '^[0-9]{8,11}$', message: '电话号码格式不正确'}]}>
          <Input style={{width:200}}/>
        </Form.Item>
        <Form.Item
          name="vendor"
          label="制作单位"
          extra='请填写全称'
          rules={[{required: true,message: '请输入制作单位',whitespace: true}]}>
          <Input style={{width:200}}/>
        </Form.Item>
        <Form.Item
          name="mediaName"
          rules={[{required: true,message: '请输入刊播媒体'}]}
          label="刊播媒体/出版社">
          <Input style={{width:400}}/>
        </Form.Item>
        <Form.Item
          name="subMediaName"
          rules={[{required: true,message: '请输入版面/栏目/ISBN编号'}]}
          label="版面/栏目/ISBN编号">
          <Input style={{width:400}}/>
        </Form.Item>
        <Form.Item
          name="mediaPlayDate"
          extra='首次刊播于2024年内的作品'
          rules={[{required: true,message: '请输入首次刊播/刊登/出版时间'}]}
          label="首次刊播/刊登/出版时间">
          <DatePicker
            disabledDate={date => date.isAfter('2025-01-01') || date.isBefore('2024-01-01')}
            placeholder="刊播时间"/>
        </Form.Item>
        <Form.Item
          name="mediaPlayTimes"
          rules={[{required: true,message: '请输入最高阅读/播放量(万)'}]}
          label="最高阅读/播放量/发行量(万)">
          <InputNumber placeholder="播放量" />
        </Form.Item>
        {/*<Form.Item name="intro" label="介绍"*/}
        {/*           rules={[{required: true,message: '请填写作品介绍'}]}>*/}
        {/*  <Input.TextArea rows={5} showCount maxLength={100} style={{width:500}}/>*/}
        {/*</Form.Item>*/}
        <Form.Item
          name="mediaLink"
          label="作品链接"
          extra='如为系列作品，请选取有代表性的一个作品上传链接'
          rules={[{required: true,message: '请输入作品链接'}]}>
          <Input style={{width:400}}/>
        </Form.Item>
        <Form.Item name="attachment" label="作品上传"
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
        <Form.Item name="selfRecommendation" label="自荐说明"
                   rules={[{required: true,message: '请输入自荐说明'}]}>
          <Input.TextArea
            showCount
            rows={6}
            maxLength={300}
            placeholder="请高度概括自身特点及成就, 限300字."
            disabled={props.viewMode}/>
        </Form.Item>

        <PrizeTable
          prizeList={editObj.prizeList ? editObj.prizeList : []}
          onChangePrize={(prizeList) => editObj.prizeList = prizeList}
          onDeletePrize={(prizeList) => editObj.prizeList = prizeList}
        />
        <SubsidizeTable
          subsidizeList={editObj.subsidizeList ? editObj.subsidizeList : []}
          onChangeSubsidize={(subsidizeList) => editObj.subsidizeList = subsidizeList}
          onDeleteSubsidize={(subsidizeList) => editObj.subsidizeList = subsidizeList}
        />

        <Card title="申报项目情况" bordered={false} style={{ width: '100%' }}>
          <Form.Item name="projectBrief" label="项目综述" labelCol={4} wrapperCol={20}>
            <Input.TextArea
              showCount
              rows={6}
              maxLength={500}
              placeholder="请高度概括申报项目的内容、亮点特色及社会影响等"
              disabled={props.viewMode}/>
          </Form.Item>
          <Form.Item name="projectDesc" label="项目介绍" labelCol={4} wrapperCol={20}>
            <Input.TextArea
              showCount
              rows={14}
              maxLength={2000}
              placeholder="请详细介绍项目，成果实施、应用和普及情况，产生的社会效益及贡献等"
              disabled={props.viewMode} />
          </Form.Item>
        </Card>

      </Form>
    )
  }

  /**
   * effect不能用props.editObj做检查判断, 如果连续编辑同一条记录导致对象无变化的话, effect就不会重复执行.
   * effect不能只执行一次, 第一次执行是在父类初始化的时候. 要求每次改变props值都要执行一次
   */
  useEffect(() => {
    if (props.editObj !== editObj){
      //要先把form清空, 再重新设置新的值, 否则当add的时候, 传入空对象, 无法覆盖之前的显示
      form.resetFields();
      form.setFieldsValue(props.editObj);
      if (props.editObj.topic !== TOPIC_agws
        &&props.editObj.topic !== TOPIC_jbfz
        &&props.editObj.topic !== TOPIC_rqjk
        &&props.editObj.topic !== TOPIC_zycj){
        form.setFieldValue('topic', TOPIC_qita);
        form.setFieldValue('otherTopic', props.editObj.topic);
      }

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
   * 点击Cancel关闭Modal, 这个是有要判断是不是有新上传的文件, 有的话要求用户手动删除后再关闭. 避免产生服务端垃圾文件.
   * 如果是修改界面, 附件内容并没有变化, 那就不必要用户删除.
   */
  const handleCancel = () => {
    if (fileList && fileList.length > 0){
      if (fileList[0].response !== props.editObj?.fileUrl) {
        message.warn('请手动删除已上传的文件, 再关闭此窗口.');
        return;
      }
    }
    form.resetFields();
    //reset this obj as null while close this window. If not, 'useEffect' will ignore to set form fields because there is an object compare
    setEditObj({});
    props.onCancel();
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
        footer={[
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
            title='确认提交该作品？提交后数据不可再修改。'>
            <Button key="print" type="primary">
              提交
            </Button>
          </Popconfirm>
        ]}
        width={1000}>
        {buildForm()}
      </Modal>
    </Spin>
  )

}

export default WorksModal;
