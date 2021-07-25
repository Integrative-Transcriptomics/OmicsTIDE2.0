from flask import Flask
import os

# create instace of application 
app = Flask(__name__, static_folder='../build', static_url_path='/')
if __name__ == '__main__':
    app.config['TEMPLATES_AUTO_RELOAD'] = True
    app.config['SEND_FILE_MAX_AGE_DEFAULT'] = 0
    app.run(host=os.getenv('IP', '0.0.0.0'),
            port=int(os.getenv('PORT', 4444)))
#app.register_blueprint(export_files, url_prefix="")