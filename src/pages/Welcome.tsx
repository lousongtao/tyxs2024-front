import { PageContainer } from '@ant-design/pro-components';
import {Alert, Card, List} from 'antd';
import React from 'react';


const Welcome: React.FC = () => {
  const data = [
    {
      'URL': 'http://workscollect.shbxjk.cn/PublicDownload/优秀健康科普作品推荐表.doc',
      'displayName': '优秀健康科普作品推荐表'
    },
    {
      'URL': 'http://workscollect.shbxjk.cn/PublicDownload/健康科普人物推荐表.doc',
      'displayName': '健康科普人物推荐表'
    },
    {
      'URL': 'http://workscollect.shbxjk.cn/PublicDownload/健康科普品牌推荐表.docx',
      'displayName': '健康科普品牌推荐表'
    },
    {
      'URL': 'http://workscollect.shbxjk.cn/PublicDownload/健康科普管理推荐表.docx',
      'displayName': '健康科普管理推荐表'
    },
    {
      'URL': 'http://workscollect.shbxjk.cn/PublicDownload/推荐选树系统操作手册.docx',
      'displayName': '推荐选树系统操作手册'
    }

  ];
  return (
    <PageContainer>
      <Card>
        <Alert
          message='欢迎参与健康科普引领展示活动'
          type="success"
          showIcon
          banner
          style={{
            margin: -12,
            marginBottom: 24,
          }}
        />
        <List
          header='文件下载'
          bordered
          dataSource={data}
          renderItem={(item) => (
            <List.Item>
              <a href={item.URL} target='_blank'>{item.displayName}</a>
            </List.Item>
          )}
        />
      </Card>
    </PageContainer>
  );
};

export default Welcome;
