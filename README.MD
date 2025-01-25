说明：

训练数据来自youtube频道，

翻译数据使用了Gemini flash 2.0 exp 大模型。


一共有3个字典

1.简单字典，包括基本音标和中文注释

2.基本字典  包括基本音标和中文注释，还有示例和其他解析

3.进阶字典  在基本字典上增加更多的语法解析。
node cleanEmptyFiles.js --dir="./gemini_dic/dic_temp_11_gemini15pro_full_complete" --ext=".md" --minSize=100