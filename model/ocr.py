# -*- coding: utf-8 -*-
"""OCR.ipynb

Automatically generated by Colaboratory.

Original file is located at
    https://colab.research.google.com/drive/1w-rQMjJ1vi611MTqQQJ33fhctSfcjNdA
"""

! pip install easyocr

import easyocr
reader = easyocr.Reader(['en'])
result = reader.readtext('d.png',paragraph=True)
result

result = reader.readtext('dish.png',paragraph=True)

result

