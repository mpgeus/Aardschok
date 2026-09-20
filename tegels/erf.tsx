<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.11.0" name="erf" tilewidth="460" tileheight="285" tilecount="7" columns="7" objectalignment="bottom">
 <tileoffset x="104" y="156"/>
 <properties>
  <property name="notitie" value="Wat er op het erf van de toren staat: het schuurtje, de put, de houtstapel, de waslijn, de moestuin, de bank en de lantaarn. Zet ze neer op de tegel linksboven van hun voet (&quot;beslaat&quot;); kaarten/erf.tmj doet dat al vanzelf uit erf-scene.cjs."/>
 </properties>
 <image source="erf.png" width="3220" height="285"/>
 <tile id="0">
  <properties>
    <property name="naam" value="schuurtje"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x4"/>
    <property name="staat_op_erf" value="5,-5"/>
  </properties>
 </tile>
 <tile id="1">
  <properties>
    <property name="naam" value="put"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="1x1"/>
    <property name="staat_op_erf" value="3,4"/>
  </properties>
 </tile>
 <tile id="2">
  <properties>
    <property name="naam" value="houtstapel"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="2x2"/>
    <property name="staat_op_erf" value="4,0"/>
  </properties>
 </tile>
 <tile id="3">
  <properties>
    <property name="naam" value="waslijn"/>
    <property name="vast" type="bool" value="false"/>
    <property name="beslaat" value="1x1"/>
    <property name="staat_op_erf" value="-7,5"/>
  </properties>
 </tile>
 <tile id="4">
  <properties>
    <property name="naam" value="moestuin"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="staat_op_erf" value="-10,-2"/>
  </properties>
 </tile>
 <tile id="5">
  <properties>
    <property name="naam" value="bank"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="1x1"/>
    <property name="staat_op_erf" value="2,0"/>
  </properties>
 </tile>
 <tile id="6">
  <properties>
    <property name="naam" value="lantaarn"/>
    <property name="vast" type="bool" value="false"/>
    <property name="beslaat" value="1x1"/>
    <property name="staat_op_erf" value="-3,2"/>
  </properties>
 </tile>
</tileset>
