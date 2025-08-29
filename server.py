from flask import Flask, request, send_file, jsonify
from flask_cors import CORS
import subprocess
import os
import tempfile
from werkzeug.utils import secure_filename
import logging

# 配置日志
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
# 配置 CORS，允许所有来源
CORS(app, resources={r"/*": {"origins": "*"}})

@app.route('/')
def index():
    return jsonify({'status': 'ok', 'message': 'Markitdown conversion server is running'})

@app.route('/convert', methods=['POST', 'OPTIONS'])
def convert_file():
    try:
        logger.info(f"Received request: {request.method}")
        logger.info(f"Headers: {dict(request.headers)}")
        
        # 处理 OPTIONS 请求
        if request.method == 'OPTIONS':
            return '', 200

        # 检查是否是测试请求
        if request.is_json and request.json.get('test'):
            logger.info("Received test request")
            return jsonify({'status': 'ok'}), 200

        if 'file' not in request.files:
            logger.error('No file part in request')
            return jsonify({'error': 'No file part'}), 400
        
        file = request.files['file']
        if file.filename == '':
            logger.error('No selected file')
            return jsonify({'error': 'No selected file'}), 400

        logger.info(f'Processing file: {file.filename}')

        # 创建临时文件
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename)[1]) as input_file:
            file.save(input_file.name)
            input_path = input_file.name
            logger.debug(f'Input file saved to: {input_path}')

        # 创建输出临时文件
        output_file = tempfile.NamedTemporaryFile(delete=False, suffix='.md')
        output_path = output_file.name
        output_file.close()
        logger.debug(f'Output file will be saved to: {output_path}')

        try:
            # 执行 Docker 命令
            cmd = f'docker run --rm -i markitdown:latest < {input_path} > {output_path}'
            logger.debug(f'Executing command: {cmd}')
            result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
            
            if result.stderr:
                logger.warning(f'Docker command stderr: {result.stderr}')

            # 检查输出文件是否存在且不为空
            if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
                raise Exception('Conversion produced no output')

            # 发送转换后的文件
            return send_file(
                output_path,
                as_attachment=True,
                download_name=f'{os.path.splitext(secure_filename(file.filename))[0]}.md'
            )
        except subprocess.CalledProcessError as e:
            logger.error(f'Docker command failed: {str(e)}')
            logger.error(f'Command output: {e.output}')
            logger.error(f'Command stderr: {e.stderr}')
            return jsonify({'error': f'Conversion failed: {str(e)}'}), 500
        except Exception as e:
            logger.error(f'Conversion error: {str(e)}')
            return jsonify({'error': f'Conversion failed: {str(e)}'}), 500
        finally:
            # 清理临时文件
            try:
                if os.path.exists(input_path):
                    os.unlink(input_path)
                if os.path.exists(output_path):
                    os.unlink(output_path)
            except Exception as e:
                logger.error(f'Error cleaning up temp files: {str(e)}')
    except Exception as e:
        logger.error(f'Unexpected error: {str(e)}')
        return jsonify({'error': f'Server error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8181, debug=True) 