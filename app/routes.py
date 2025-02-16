# 删除这段不需要的路由代码
# @app.route('/guide')
# def guide():
#     return render_template('guide.html')

@app.route('/')
def index():
    page = request.args.get('page', 1, type=int)
    articles_data = Article.load_from_file(page=page)
    return render_template('index.html', **articles_data)