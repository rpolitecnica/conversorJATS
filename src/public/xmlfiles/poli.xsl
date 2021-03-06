<?xml version="1.0" encoding="UTF-8"?>

<xsl:stylesheet version="1.0"
xmlns:xsl="http://www.w3.org/1999/XSL/Transform">

<xsl:template match="article">
  <html>
  <body>

	<center>
	<b>
	Plantilla diseñada por
	<i>Revista Politécnica 2019</i>
	-- Archivo solo para intercambio de información con repositorios
	</b>
	<b>
	<br/>
	Para lectura, se recomienda galeradas HTML y PDF
	</b>
	</center>
	<hr/>

	<h3><xsl:value-of select="front/article-meta/title-group/article-title"/></h3>

	<xsl:for-each select="front/article-meta/contrib-group/contrib/name">
		<em>
		<xsl:if test="not(position() = 1)">,
		</xsl:if>
		<xsl:value-of select="given-names"/> <xsl:text> </xsl:text>
		<xsl:value-of select="surname"/>
		</em>
	</xsl:for-each>

	<br/>
	<br/>
	<h4>Resumen</h4>
	<p>
		<xsl:value-of select="front/article-meta/abstract"/>
	</p>
	<p>
		<em>
		<xsl:value-of select="sub-article/front-stub/abstract"/>
		</em>
	</p>

	<h4>References</h4>
		<xsl:for-each select="back/ref-list/ref">
			<p>
			<xsl:value-of select="mixed-citation"/>
			</p>
    </xsl:for-each>

	<p>DOI:
	<xsl:element name="a">
		<xsl:attribute name="href">
			https://doi.org/<xsl:value-of select="front/article-meta/article-id"/>
		</xsl:attribute>
			https://doi.org/<xsl:value-of select="front/article-meta/article-id"/>
	</xsl:element>
</p>
	</body>
  </html>
</xsl:template>

</xsl:stylesheet>