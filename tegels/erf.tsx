<?xml version="1.0" encoding="UTF-8"?>
<tileset version="1.10" tiledversion="1.11.0" name="erf" tilewidth="332" tileheight="285" tilecount="24" columns="0" objectalignment="bottom">
 <grid orientation="orthogonal" width="1" height="1"/>
 <properties>
  <property name="notitie" value="Wat er op het erf van de toren staat: het schuurtje, de put, de houtstapel, de waslijn, de moestuin, de bank en de lantaarn. Zet ze neer op de tegel linksboven van hun voet (&quot;beslaat&quot;); kaarten/erf.tmj doet dat al vanzelf uit erf-scene.cjs. Ingepakt: elke tegel is een eigen rechthoek op het vel. In Tiled staan de voorwerpen daardoor niet precies op hun plek; het spel zet ze neer met hun eigen anker (tegels.json)."/>
 </properties>
 <tile id="0" x="334" y="0" width="325" height="285">
  <properties>
    <property name="naam" value="schuurtje"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x4"/>
    <property name="staat_op_erf" value="5,-5"/>
  </properties>
  <image source="erf.png" width="1024" height="572"/>
 </tile>
 <tile id="1" x="902" y="0" width="122" height="285">
  <properties>
    <property name="naam" value="put"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="2x2"/>
    <property name="staat_op_erf" value="3,4"/>
  </properties>
  <image source="erf.png" width="1024" height="572"/>
 </tile>
 <tile id="2" x="0" y="287" width="112" height="285">
  <properties>
    <property name="naam" value="houtstapel"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="2x2"/>
    <property name="staat_op_erf" value="4,0"/>
  </properties>
  <image source="erf.png" width="1024" height="572"/>
 </tile>
 <tile id="3" x="0" y="0" width="332" height="285">
  <properties>
    <property name="naam" value="waslijn"/>
    <property name="vast" type="bool" value="false"/>
    <property name="beslaat" value="1x1"/>
    <property name="staat_op_erf" value="-7,5"/>
  </properties>
  <image source="erf.png" width="1024" height="572"/>
 </tile>
 <tile id="4" x="661" y="0" width="239" height="285">
  <properties>
    <property name="naam" value="moestuin"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="5x5"/>
    <property name="staat_op_erf" value="-10,-2"/>
  </properties>
  <image source="erf.png" width="1024" height="572"/>
 </tile>
 <tile id="5" x="114" y="287" width="64" height="285">
  <properties>
    <property name="naam" value="bank"/>
    <property name="vast" type="bool" value="true"/>
    <property name="beslaat" value="1x1"/>
    <property name="staat_op_erf" value="2,0"/>
  </properties>
  <image source="erf.png" width="1024" height="572"/>
 </tile>
 <tile id="6" x="180" y="287" width="21" height="285">
  <properties>
    <property name="naam" value="lantaarn"/>
    <property name="vast" type="bool" value="false"/>
    <property name="beslaat" value="1x1"/>
    <property name="staat_op_erf" value="-3,2"/>
  </properties>
  <image source="erf.png" width="1024" height="572"/>
 </tile>
 <tile id="7">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="8">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="9">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="10">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="11">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="12">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="13">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="14">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="15">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="16">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="17">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="18">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="19">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="20">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="21">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="22">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
 <tile id="23">
  <properties>
    <property name="naam" value=""/>
    <property name="vast" type="bool" value="false"/>
  </properties>
 </tile>
</tileset>
