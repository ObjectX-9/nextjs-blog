import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { ISite } from "@/app/model/site";
import { IEducation } from "@/app/model/education";

// 生成随机验证码
function generateVerificationCode(length: number = 6): string {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}

// 检查验证码是否过期
function isVerificationCodeExpired(createTime?: number, expirationHours?: number): boolean {
  if (!createTime || !expirationHours) return true;
  const now = Date.now();
  const expirationTime = createTime + (expirationHours * 60 * 60 * 1000);
  return now > expirationTime;
}

// Get site information
export async function GET() {
  try {
    const db = await getDb();
    const collection = db.collection<ISite>("sites");

    // Get the first site document (assuming we only have one site)
    const site = await collection.findOne({}, { maxTimeMS: 1000 });

    // 检查验证码是否过期，如果过期则生成新的
    if (site?.isOpenVerifyArticle && isVerificationCodeExpired(site.verificationCodeCreateTime, site.verificationCodeExpirationTime)) {
      const newVerificationCode = generateVerificationCode();
      const createTime = Date.now();

      await collection.updateOne(
        { _id: site._id },
        {
          $set: {
            verificationCode: newVerificationCode,
            verificationCodeCreateTime: createTime,
            verificationCodeExpirationTime: site.verificationCodeExpirationTime || 24 // 默认24小时
          }
        }
      );
      site.verificationCode = newVerificationCode;
      site.verificationCodeCreateTime = createTime;
      site.verificationCodeExpirationTime = site.verificationCodeExpirationTime || 24;
    }

    // 设置响应头以防止缓存
    const headers = new Headers({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    });

    if (!site) {
      // 如果没有站点信息，创建一个默认的
      const defaultSite: ISite = {
        createdAt: new Date(),
        visitCount: 0,
        likeCount: 0,
        favicon: "",
        qrcode: "",
        appreciationCode: "",
        wechatGroup: "",
        wechatGroupName: "", // 添加微信公众号名称
        wechatKeyword: "", // 添加微信公众号关键词
        googleTagManagerId: "", // 添加谷歌标签管理器ID
        googleAdsenseId: "", // 添加谷歌广告 ID
        title: "我的博客",
        description: "这是一个博客网站",
        backgroundImage: "/images/background.jpg",
        author: {
          name: "作者",
          avatar: "",
          description: "一个热爱生活和分享技术的程序员",
          bio: "这是作者简介",
          education: [{
            school: "示例大学",
            major: "计算机科学与技术",
            degree: "学士",
            certifications: ["CET6"],
            startDate: "2018-09-01",
            endDate: "2022-07-01"
          }]
        },
        seo: {
          keywords: ["博客"],
          description: "博客描述",
        },
        isOpenVerifyArticle: false,
        verificationCode: "",
        verificationCodeCreateTime: 0,
        verificationCodeExpirationTime: 24 // 默认24小时
      };

      const result = await collection.insertOne(defaultSite);
      if (result.acknowledged) {
        return NextResponse.json({ success: true, site: defaultSite }, { headers });
      }
    }

    return NextResponse.json({ success: true, site }, { headers });
  } catch (error) {
    console.error("Error fetching site information:", error);
    return NextResponse.json(
      { success: false, error: "获取站点信息失败" },
      { status: 500 }
    );
  }
}

// 增加访问量和点赞
export async function PATCH(request: Request) {
  try {
    const { type } = await request.json()

    const db = await getDb();
    const collection = db.collection<ISite>("sites");

    const site = await collection.findOne()
    if (!site) {
      return NextResponse.json({ error: "Site not found" }, { status: 404 })
    }

    if (type === 'like') {
      site.likeCount += 1
    } else if (type === 'visit') {
      site.visitCount += 1
    }

    await collection.updateOne({ _id: site._id }, { $set: site })

    return NextResponse.json({ success: true, site })
  } catch (error) {
    console.error('Error updating site stats:', error)
    return NextResponse.json({ error: "Failed to update site stats" }, { status: 500 })
  }
}

// Create or update site information
export async function POST(request: Request) {
  try {
    const siteData = await request.json();
    console.log('Received site data:', siteData);

    // 验证数据结构
    if (!siteData || typeof siteData !== 'object') {
      return NextResponse.json(
        { success: false, error: "无效的数据格式" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = db.collection<ISite>("sites");

    // 保持原有的访问量和点赞数
    const currentSite = await collection.findOne({});
    console.log('Current site data:', currentSite);

    // 从数据中移除 _id 字段
    const { _id, ...siteDataWithoutId } = siteData;

    const updatedSiteData = {
      ...siteDataWithoutId,
      // 使用传入的访问量和点赞数，如果没有则使用当前值或默认值0
      visitCount: siteDataWithoutId.visitCount ?? currentSite?.visitCount ?? 0,
      likeCount: siteDataWithoutId.likeCount ?? currentSite?.likeCount ?? 0,
      createdAt: siteDataWithoutId.createdAt ? new Date(siteDataWithoutId.createdAt) : (currentSite?.createdAt || new Date()),
      // 确保嵌套对象存在
      author: {
        name: siteData.author?.name || '',
        avatar: siteData.author?.avatar || '',
        bio: siteData.author?.bio || '',
        description: siteData.author?.description || '',
        education: Array.isArray(siteData.author?.education)
          ? siteData.author.education.map((edu: IEducation) => ({
            school: edu.school || '',
            major: edu.major || '',
            degree: edu.degree || '',
            certifications: Array.isArray(edu.certifications) ? edu.certifications : [],
            startDate: edu.startDate || '',
            endDate: edu.endDate || ''
          }))
          : currentSite?.author?.education || []
      },
      seo: {
        keywords: Array.isArray(siteData.seo?.keywords) ? siteData.seo.keywords : [],
        description: siteData.seo?.description || '',
      },
      // 确保其他字段都有值
      title: siteData.title || '',
      description: siteData.description || '',
      favicon: siteData.favicon || '',
      qrcode: siteData.qrcode || '',
      appreciationCode: siteData.appreciationCode || '',
      wechatGroup: siteData.wechatGroup || '',
      wechatGroupName: siteData.wechatGroupName || '', // 添加微信公众号名称
      wechatKeyword: siteData.wechatKeyword || '', // 添加微信公众号关键词
      googleTagManagerId: siteData.googleTagManagerId || '', // 添加谷歌标签管理器ID
      googleAdsenseId: siteData.googleAdsenseId || '', // 添加谷歌广告 ID
      backgroundImage: siteData.backgroundImage || '/images/background.jpg',
      icp: siteData.icp || '',
      // 添加验证码相关字段
      isOpenVerifyArticle: siteData.isOpenVerifyArticle ?? currentSite?.isOpenVerifyArticle ?? false,
      verificationCode: siteData.verificationCode || currentSite?.verificationCode || '',
      verificationCodeCreateTime: siteData.verificationCodeCreateTime || currentSite?.verificationCodeCreateTime || 0,
      verificationCodeExpirationTime: siteData.verificationCodeExpirationTime || currentSite?.verificationCodeExpirationTime || 24
    };

    console.log('Prepared update data:', updatedSiteData);

    let result;
    try {
      if (currentSite) {
        // 如果存在，则更新
        console.log('Updating existing site...');
        const filter = currentSite._id ? { _id: currentSite._id } : {};
        const updateResult = await collection.updateOne(
          filter,
          { $set: updatedSiteData }
        );

        console.log('Update result:', updateResult);

        if (!updateResult.acknowledged) {
          throw new Error("更新站点信息失败");
        }

        // 获取更新后的文档
        result = await collection.findOne(filter);
        console.log('Updated site data:', result);
      } else {
        // 如果不存在，则创建新文档
        console.log('Creating new site...');
        const insertResult = await collection.insertOne(updatedSiteData);

        console.log('Insert result:', insertResult);

        if (!insertResult.acknowledged) {
          throw new Error("创建站点信息失败");
        }

        result = updatedSiteData;
      }

      if (!result) {
        throw new Error("获取更新后的站点信息失败");
      }

      return NextResponse.json({
        success: true,
        site: result
      });
    } catch (dbError: any) {
      console.error("Database operation failed:", dbError);
      return NextResponse.json(
        { success: false, error: dbError.message || "数据库操作失败" },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Error updating site information:", error);
    return NextResponse.json(
      { success: false, error: error.message || "更新站点信息失败" },
      { status: 500 }
    );
  }
}

function validateSiteData(site: Partial<ISite>): string[] {
  const errors: string[] = [];
  // 所有字段均可为空，无需验证
  return errors;
}
