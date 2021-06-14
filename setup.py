from setuptools import setup

setup(
    name='omicstide2.0',
    packages=['omicstide2.0'],
    include_package_data=True,
    install_requires=[
        'flask',
    ],
    package_data={'server': ['data/*']},
)